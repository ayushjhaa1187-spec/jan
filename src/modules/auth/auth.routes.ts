import { NextFunction, Request, Response, Router } from 'express';
import { login, logout, me, refresh, register } from './auth.controller';
import { requireAuth } from './auth.middleware';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

const authRateLimitMap = new Map<string, { count: number; windowStart: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_REQUESTS = 20;

const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = authRateLimitMap.get(key);

  if (!current || now - current.windowStart > AUTH_WINDOW_MS) {
    authRateLimitMap.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= AUTH_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many authentication requests' });
  }

  current.count += 1;
  authRateLimitMap.set(key, current);
  return next();
};

router.post('/register', authRateLimit, asyncHandler(register));
router.post('/login', authRateLimit, asyncHandler(login));
router.post('/refresh', authRateLimit, asyncHandler(refresh));
router.post('/logout', authRateLimit, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
