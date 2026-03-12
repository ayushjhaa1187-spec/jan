import { Request, Response } from 'express';

const notAvailable = (res: Response): Response => res.status(501).json({ error: 'Dashboard feature is not available in this build' });

export const getNotifications = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const getEventAnnouncements = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const createAnnouncement = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const getEventAttendees = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const getEventStats = async (_req: Request, res: Response): Promise<Response> => res.json({});
export const sendEventReminder = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const getLiveActivity = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const getAllEventsStats = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const getEventRecommendations = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const checkInRegistration = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const deleteRegistration = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const bulkCheckIn = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const bulkDelete = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
