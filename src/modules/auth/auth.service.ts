import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/auditLogger';
import { AuthTokenPayload, AuthenticatedUser } from './auth.types';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;

const refreshTokenStore = new Map<string, Set<string>>();

const normalizePermission = (action: string, resource: string): string =>
  `${action}_${resource}`.toLowerCase();

const buildName = (user: {
  email: string;
  studentProfile?: { firstName: string; lastName: string } | null;
  teacherProfile?: { firstName: string; lastName: string } | null;
  staffProfile?: { firstName: string; lastName: string } | null;
}): string => {
  if (user.teacherProfile) {
    return `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`;
  }

  if (user.studentProfile) {
    return `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
  }

  if (user.staffProfile) {
    return `${user.staffProfile.firstName} ${user.staffProfile.lastName}`;
  }

  return user.email.split('@')[0];
};

const buildAuthUser = async (userId: string): Promise<AuthenticatedUser & { name: string } | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teacherProfile: true,
      studentProfile: true,
      staffProfile: true,
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
  });

  if (!user) {
    return null;
  }

  const roles = user.userRoles.map((item) => item.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((item) =>
        item.role.permissions.map((rp) => normalizePermission(rp.permission.action, rp.permission.resource)),
      ),
    ),
  );

  return {
    id: user.id,
    name: buildName(user),
    email: user.email,
    isActive: user.isActive,
    role: roles[0] || 'User',
    roles,
    permissions,
  };
};

const signAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

const persistRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const hashed = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
  const existing = refreshTokenStore.get(userId) || new Set<string>();
  existing.add(hashed);
  refreshTokenStore.set(userId, existing);
};

const validateRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const hashedSet = refreshTokenStore.get(userId);
  if (!hashedSet || hashedSet.size === 0) {
    return false;
  }

  for (const hashed of hashedSet) {
    if (await bcrypt.compare(refreshToken, hashed)) {
      return true;
    }
  }

  return false;
};

const invalidateRefreshTokens = (userId: string): void => {
  refreshTokenStore.delete(userId);
};

export const authService = {
  async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account disabled', 403);
    }

    const fullUser = await buildAuthUser(user.id);
    if (!fullUser) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: AuthTokenPayload = {
      userId: fullUser.id,
      role: fullUser.role,
      permissions: fullUser.permissions,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await persistRefreshToken(fullUser.id, refreshToken);

    void logAudit({
      userId: fullUser.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: fullUser.id,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        permissions: fullUser.permissions,
      },
    };
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    let decoded: AuthTokenPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const isValid = await validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      throw new AppError('Invalid refresh token', 401);
    }

    const fullUser = await buildAuthUser(decoded.userId);
    if (!fullUser || !fullUser.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = signAccessToken({
      userId: fullUser.id,
      role: fullUser.role,
      permissions: fullUser.permissions,
    });

    void logAudit({
      userId: fullUser.id,
      action: 'REFRESH_TOKEN',
      entity: 'User',
      entityId: fullUser.id,
    });

    return { accessToken };
  },

  async logout(userId: string, ipAddress?: string): Promise<void> {
    invalidateRefreshTokens(userId);

    void logAudit({
      userId,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress,
    });
  },

  async getMe(userId: string) {
    const user = await buildAuthUser(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
  },

  async getCurrentUser(userId: string): Promise<AuthenticatedUser | null> {
    const user = await buildAuthUser(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
    };
  },

  verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  },


  getUserIdFromRefreshToken(refreshToken: string): string {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload;
    return decoded.userId;
  },

};
