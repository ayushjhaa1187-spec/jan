import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { notificationService } from './notification.service';
import { listNotificationsSchema } from './notification.validation';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  return userId;
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listNotificationsSchema.parse(req.query);
    const data = await notificationService.listNotifications(getUserId(req), query);
    return res.json({ success: true, data: data.data, meta: data.meta });
  } catch (error) {
    return next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notificationService.getUnreadCount(getUserId(req));
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(getUserId(req), String(req.params.id));
    return res.json({ success: true, data: null });
  } catch (error) {
    return next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(getUserId(req));
    return res.json({ success: true, data: null });
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.deleteNotification(getUserId(req), String(req.params.id));
    return res.json({ success: true, data: null });
  } catch (error) {
    return next(error);
  }
};

export const clearAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.clearAll(getUserId(req));
    return res.json({ success: true, data: null });
  } catch (error) {
    return next(error);
  }
};
