import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markNotificationRead,
} from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
