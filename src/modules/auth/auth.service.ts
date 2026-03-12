import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { AuthTokenPayload, LoginInput } from './auth.types';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;

const refreshTokenStore = new Map<string, Set<string>>();

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
}

const toPermissionKey = (action: string, resource: string): string => `${action}_${resource}`.toLowerCase();

const getAuthUser = async (userId: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const role = roles[0] ?? 'User';
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.permissions.map((rp) => toPermissionKey(rp.permission.action, rp.permission.resource)),
      ),
    ),
  );

  return {
    id: user.id,
    name: user.email.split('@')[0],
    email: user.email,
    role,
    roles,
    permissions,
    isActive: user.isActive,
  };
};

const signAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

const persistRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const hashed = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
  const current = refreshTokenStore.get(userId) ?? new Set<string>();
  current.add(hashed);
  refreshTokenStore.set(userId, current);
};

const validateRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const stored = refreshTokenStore.get(userId);
  if (!stored || stored.size === 0) {
    return false;
  }

  for (const hash of stored) {
    if (await bcrypt.compare(refreshToken, hash)) {
      return true;
    }
  }

  return false;
};

const invalidateUserRefreshTokens = (userId: string): void => {
  refreshTokenStore.delete(userId);
};

export const authService = {
  async login(email: string, password: string, ipAddress?: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordValid = await bcrypt.compare(password, dbUser.password);
    if (!passwordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!dbUser.isActive) {
      throw new AppError('Account disabled', 403);
    }

    const authUser = await getAuthUser(dbUser.id);
    if (!authUser) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: AuthTokenPayload = {
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await persistRefreshToken(authUser.id, refreshToken);

    void logAudit({
      userId: authUser.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: authUser.id,
      ipAddress,
    });

    return { accessToken, refreshToken, user: authUser };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: AuthTokenPayload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const valid = await validateRefreshToken(payload.userId, refreshToken);
    if (!valid) {
      throw new AppError('Invalid refresh token', 401);
    }

    const authUser = await getAuthUser(payload.userId);
    if (!authUser) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = signAccessToken({
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    });

    void logAudit({
      userId: authUser.id,
      action: 'REFRESH_TOKEN',
      entity: 'User',
      entityId: authUser.id,
    });

    return { accessToken };
  },

  async logout(userId: string, ipAddress?: string): Promise<void> {
    invalidateUserRefreshTokens(userId);

    void logAudit({
      userId,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress,
    });
  },

  async getMe(userId: string): Promise<AuthUser> {
    const authUser = await getAuthUser(userId);
    if (!authUser) {
      throw new AppError('User not found', 404);
    }

    return authUser;
  },

  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    return getAuthUser(userId);
  },

  verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  },

  async loginWithInput(input: LoginInput, ipAddress?: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    return this.login(input.email, input.password, ipAddress);
  },
};
