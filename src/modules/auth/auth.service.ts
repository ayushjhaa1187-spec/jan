import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import { AuthTokenPayload, AuthenticatedUser, LoginInput, TokenPair } from './auth.types';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;

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

  const roles = user.userRoles.map((userRole) => userRole.role.name);
  const permissions = Array.from(
    new Set<string>(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) =>
          normalizePermission(
            rolePermission.permission.action,
            rolePermission.permission.resource,
          ),
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

const signAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
};

const signRefreshToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
};

const persistRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
  const userTokens = refreshTokenStore.get(userId) || new Set<string>();
  userTokens.add(hashedToken);
  refreshTokenStore.set(userId, userTokens);
};

const validateRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const userTokens = refreshTokenStore.get(userId);
  if (!userTokens || userTokens.size === 0) {
    return false;
  }

  for (const hashedToken of userTokens) {
    const valid = await bcrypt.compare(refreshToken, hashedToken);
    if (valid) {
      return true;
    }
  }

  return false;
};

const removeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const userTokens = refreshTokenStore.get(userId);
  if (!userTokens || userTokens.size === 0) {
    return;
  }

  for (const hashedToken of userTokens) {
    const valid = await bcrypt.compare(refreshToken, hashedToken);
    if (valid) {
      userTokens.delete(hashedToken);
      break;
    }
  }

  if (userTokens.size === 0) {
    refreshTokenStore.delete(userId);
  }
};

export const authService = {
  async login(input: LoginInput): Promise<{ user: AuthenticatedUser; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const authUser = await buildAuthUser(user.id);
    if (!authUser || !authUser.isActive) {
      throw new Error('Account is inactive');
    }

    const payload: AuthTokenPayload = {
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await persistRefreshToken(authUser.id, refreshToken);

    return {
      user: authUser,
      tokens: { accessToken, refreshToken },
    };
  },

  async refresh(refreshToken: string): Promise<{ user: AuthenticatedUser; accessToken: string }> {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload;

    const isValidToken = await validateRefreshToken(decoded.userId, refreshToken);
    if (!isValidToken) {
      throw new Error('Invalid refresh token');
    }

    const authUser = await buildAuthUser(decoded.userId);
    if (!authUser || !authUser.isActive) {
      throw new Error('User not found');
    }

    const accessToken = signAccessToken({
      userId: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
    });

    return { user: authUser, accessToken };
  },

  async logout(refreshToken: string): Promise<void> {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthTokenPayload;
    await removeRefreshToken(decoded.userId, refreshToken);
  },

  async getCurrentUser(userId: string): Promise<AuthenticatedUser | null> {
    return buildAuthUser(userId);
  },

  verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  },
};
