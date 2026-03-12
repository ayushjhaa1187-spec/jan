import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { success } from '../../utils/apiResponse';
import { authService } from './auth.service';

const getRequestIp = (req: Request): string | undefined => req.ip || undefined;

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  return userId;
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const data = await authService.login(email, password, getRequestIp(req));
    return res.json(success(data, 'Login successful'));
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    const data = await authService.refresh(refreshToken);
    return res.json(success(data, 'Token refreshed'));
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      await authService.logout(userId, getRequestIp(req));
      return res.json(success(null, 'Logged out successfully'));
    }

    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    if (!refreshToken) {
      throw new AppError('refreshToken is required', 400);
    }

    const refreshUserId = authService.getUserIdFromRefreshToken(refreshToken);
    await authService.logout(refreshUserId, getRequestIp(req));
    return res.json(success(null, 'Logged out successfully'));
  } catch (error) {
    return next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getMe(getUserId(req));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};
