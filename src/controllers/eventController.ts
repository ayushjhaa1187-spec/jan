import { Request, Response } from 'express';

export const getPublicEvents = async (_req: Request, res: Response): Promise<Response> => {
  return res.json([]);
};

export const getEventDetails = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(404).json({ error: 'Event not found' });
};

export const getGlobalStats = async (_req: Request, res: Response): Promise<Response> => {
  return res.json({ totalEvents: 0, totalRegistrations: 0 });
};

export const createEvent = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'Event creation is not available in this build' });
};

export const updateEvent = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'Event update is not available in this build' });
};

export const deleteEvent = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'Event deletion is not available in this build' });
};

export const getAdminEvents = async (_req: Request, res: Response): Promise<Response> => {
  return res.json([]);
};
