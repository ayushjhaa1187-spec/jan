import { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyAccessToken(token);

    // SCALE OPTIMIZATION: Use the token payload directly to avoid a DB hit on every request.
    // In a production-scale distributed system, we trust the signed token for its duration.
    req.user = {
      id: payload.userId,
      orgId: payload.orgId,
      email: '', // Not needed for most permission/org checks
      role: payload.role,
      roles: [payload.role],
      permissions: payload.permissions,
      isActive: true, // Assuming active if token is valid; revocation handled via expiry or blacklisting
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.roles?.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    return next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions?.includes(permission.toLowerCase())) {
      return res.status(403).json({ error: 'Forbidden: insufficient permission' });
    }

    return next();
  };
};
