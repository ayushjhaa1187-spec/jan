import { Request, Response } from 'express';

export const generateBroadcast = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'AI broadcast is not available in this build' });
};

export const generateEventReport = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'AI report is not available in this build' });
};
