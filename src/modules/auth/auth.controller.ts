import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from './auth.types';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshTokenFromRequest = (req: Request): string | null => {
  const authCookie = req.headers.cookie;
  if (!authCookie) {
    return null;
  }

  const cookies = authCookie.split(';').map((cookie) => cookie.trim());
  const refreshCookie = cookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`));

  if (!refreshCookie) {
    return null;
  }

  return decodeURIComponent(refreshCookie.split('=').slice(1).join('='));
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/auth',
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth',
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, tokens } = await authService.login({ email, password }, { ipAddress: req.ip });
    setRefreshCookie(res, tokens.refreshToken);

    return res.json({
      accessToken: tokens.accessToken,
      user,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const { user, accessToken } = await authService.refresh(refreshToken, { ipAddress: req.ip });
    return res.json({ accessToken, user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || getRefreshTokenFromRequest(req);
    if (refreshToken) {
      await authService.logout(refreshToken, { ipAddress: req.ip });
    }

    clearRefreshCookie(res);
    return res.status(204).send();
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(204).send();
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json(req.user);
};
