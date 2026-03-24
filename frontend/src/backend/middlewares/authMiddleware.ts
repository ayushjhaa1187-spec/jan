import { NextFunction, Request, Response } from 'express';
import {
  requireAuth as moduleRequireAuth,
  requirePermission,
  requireRole,
} from '../modules/auth/auth.middleware';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  return moduleRequireAuth(req, res, next);
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  return requireRole('Principal')(req, res, next);
};

export { requireRole, requirePermission };
