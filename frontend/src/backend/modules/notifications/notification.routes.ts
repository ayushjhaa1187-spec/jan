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
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getNotifications));
router.get('/unread-count', asyncHandler(getUnreadCount));
router.patch('/:id/read', asyncHandler(markNotificationRead));
router.patch('/read-all', asyncHandler(markAllRead));
router.delete('/clear-all', asyncHandler(clearAllNotifications));
router.delete('/:id', asyncHandler(deleteNotification));

export default router;
