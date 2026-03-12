import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { success } from '../../utils/apiResponse';
import { notificationService } from './notification.service';
import { listNotificationsSchema } from './notification.validation';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  return userId;
};

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listNotificationsSchema.parse(req.query);
    const data = await notificationService.listMyNotifications(getUserId(req), query);
    return res.json({ success: true, data: data.data, meta: data.meta });
  } catch (error) {
    return next(error);
  }
};

export const unreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notificationService.unreadCount(getUserId(req));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markRead(getUserId(req), String(req.params.id));
    return res.json(success({ id: String(req.params.id) }, 'Notification marked as read'));
  } catch (error) {
    return next(error);
  }
};

export const markReadAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markReadAll(getUserId(req));
    return res.json(success({}, 'All notifications marked as read'));
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.deleteOne(getUserId(req), String(req.params.id));
    return res.json(success({}, 'Notification deleted'));
  } catch (error) {
    return next(error);
  }
};

export const clearAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.clearAll(getUserId(req));
    return res.json(success({}, 'All notifications cleared'));
  } catch (error) {
    return next(error);
  }
};
