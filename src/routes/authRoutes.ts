import { NextFunction, Request, Response, Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { getUserRegistrations } from '../controllers/registrationController';
import { getNotifications } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

const authAttempts = new Map<string, number>();
const throttle = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (process.env.NODE_ENV === 'test') return next();
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const lastAt = authAttempts.get(ip) || 0;
  if (now - lastAt < 1000) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }
  authAttempts.set(ip, now);
  next();
};

router.post('/register', throttle, register);
router.post('/login', throttle, login);
router.get('/me', authenticate, getMe);
router.get('/me/registrations', authenticate, getUserRegistrations);
router.get('/me/notifications', authenticate, getNotifications);

export default router;
