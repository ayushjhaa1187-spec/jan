import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { AuthTokenPayload, AuthenticatedUser } from './auth.types';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;
const BCRYPT_SALT_ROUNDS = 12;

const refreshTokenStore = new Map<string, Set<string>>();

const normalizePermission = (action: string, resource: string): string =>
  `${action}_${resource}`.toLowerCase();

const buildAuthUser = async (userId: string): Promise<AuthenticatedUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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

  const roles = user.userRoles.map((entry) => entry.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((entry) =>
        entry.role.permissions.map((permission) =>
          normalizePermission(permission.permission.action, permission.permission.resource),
        ),
      ),
    ),
  );

  return {
    id: user.id,
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
  const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
  const tokens = refreshTokenStore.get(userId) || new Set<string>();
  tokens.add(hash);
  refreshTokenStore.set(userId, tokens);
};

const validateRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const hashes = refreshTokenStore.get(userId);
  if (!hashes || hashes.size === 0) {
    return false;
  }

  for (const hash of hashes) {
    const valid = await bcrypt.compare(refreshToken, hash);
    if (valid) {
      return true;
    }
  }

  return false;
};

const clearRefreshTokens = (userId: string): void => {
  refreshTokenStore.delete(userId);
};

export const authService = {
  async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account disabled', 403);
    }

    const authUser = await buildAuthUser(user.id);
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

    return {
      accessToken,
      refreshToken,
      user: {
        id: authUser.id,
        name: authUser.email.split('@')[0],
        email: authUser.email,
        role: authUser.role,
        permissions: authUser.permissions,
      },
    };
  },

  async refresh(refreshToken: string) {
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

    const authUser = await buildAuthUser(decoded.userId);
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
    clearRefreshTokens(userId);

    void logAudit({
      userId,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress,
    });
  },

  async getMe(userId: string) {
    const authUser = await buildAuthUser(userId);
    if (!authUser) {
      throw new AppError('User not found', 404);
    }

    return {
      id: authUser.id,
      name: authUser.email.split('@')[0],
      email: authUser.email,
      role: authUser.role,
      permissions: authUser.permissions,
    };
  },

  async getCurrentUser(userId: string): Promise<AuthenticatedUser | null> {
    return buildAuthUser(userId);
  },

  verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  },
};
