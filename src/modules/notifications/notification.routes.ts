import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import {
  clearAllNotifications,
  deleteNotification,
  listNotifications,
  markRead,
  markReadAll,
  unreadCount,
} from './notification.controller';

const router = Router();

router.use(authenticate);
router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.patch('/read-all', markReadAll);
router.patch('/:id/read', markRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
