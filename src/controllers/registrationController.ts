import { Request, Response } from 'express';

const notAvailable = (res: Response): Response => res.status(501).json({ error: 'Registration feature is not available in this build' });

export const registerForEvent = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const createTeam = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const getRegistrationTicket = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const getRegistrationQR = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
export const getUserRegistrations = async (_req: Request, res: Response): Promise<Response> => res.json([]);
export const joinTeam = async (_req: Request, res: Response): Promise<Response> => notAvailable(res);
