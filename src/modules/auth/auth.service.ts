import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AppError from '../../utils/AppError'
import prisma from '../../utils/prisma'
import { logAudit } from '../../utils/auditLogger'
import { AuthTokenPayload } from './auth.types'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
const BCRYPT_SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`

const refreshTokenStore = new Map<string, Set<string>>()

interface AuthUserResponse {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

const normalizePermission = (action: string, resource: string): string =>
  `${action}_${resource}`.toLowerCase()

const buildUserAndPermissions = async (userId: string): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      staffProfile: true,
      teacherProfile: true,
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const role = user.userRoles[0]?.role.name || 'User'
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) =>
          normalizePermission(rolePermission.permission.action, rolePermission.permission.resource),
        ),
      ),
    ),
  )

  const name = user.teacherProfile
    ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`
    : user.studentProfile
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
      : user.staffProfile
        ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
        : user.email.split('@')[0]

  return {
    id: user.id,
    name,
    email: user.email,
    role,
    permissions,
  }
}

const signAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })

const signRefreshToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL })

const persistRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const hashed = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS)
  const current = refreshTokenStore.get(userId) || new Set<string>()
  current.add(hashed)
  refreshTokenStore.set(userId, current)
}

const hasRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const current = refreshTokenStore.get(userId)
  if (!current || current.size === 0) {
    return false
  }

  for (const hashedToken of current) {
    const valid = await bcrypt.compare(refreshToken, hashedToken)
    if (valid) {
      return true
    }
  }

  return false
}

export const authService = {
  async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401)
    }

    if (!user.isActive) {
      throw new AppError('Account disabled', 403)
    }

    const authUser = await buildUserAndPermissions(user.id)

    const payload: AuthTokenPayload = {
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    await persistRefreshToken(user.id, refreshToken)

    void logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress,
    })

    return {
      accessToken,
      refreshToken,
      user: authUser,
    }
  },

  async refresh(refreshToken: string) {
    let decoded: AuthTokenPayload

    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload
    } catch {
      throw new AppError('Invalid refresh token', 401)
    }

    const tokenIsKnown = await hasRefreshToken(decoded.userId, refreshToken)
    if (!tokenIsKnown) {
      throw new AppError('Invalid refresh token', 401)
    }

    const authUser = await buildUserAndPermissions(decoded.userId)
    const accessToken = signAccessToken({
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    })

    void logAudit({
      userId: decoded.userId,
      action: 'REFRESH_TOKEN',
      entity: 'User',
      entityId: decoded.userId,
    })

    return { accessToken }
  },

  async logout(userId: string, ipAddress?: string): Promise<void> {
    refreshTokenStore.delete(userId)

    void logAudit({
      userId,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress,
    })
  },

  async getMe(userId: string): Promise<AuthUserResponse> {
    return buildUserAndPermissions(userId)
  },

  async getCurrentUser(userId: string): Promise<{ id: string; email: string; role: string; roles: string[]; permissions: string[]; isActive: boolean } | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return null
    }

    const mapped = await buildUserAndPermissions(userId)
    return {
      id: mapped.id,
      email: mapped.email,
      role: mapped.role,
      roles: [mapped.role],
      permissions: mapped.permissions,
      isActive: user.isActive,
    }
  },

  verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
  },
}
