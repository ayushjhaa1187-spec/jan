import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import AppError from '../utils/AppError';
import { error } from '../utils/apiResponse';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = (req as any).requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ...error(err.message, err.statusCode),
      requestId
    });
  }


  if (err instanceof ZodError) {
    return res.status(400).json(error(err.issues[0]?.message || 'Validation failed', 400));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    require('fs').appendFileSync('error.log', `[PRISMA ERROR]: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}\n`);
    if (err.code === 'P2002') {
      return res.status(409).json(error('Resource already exists', 409));
    }

    return res.status(400).json(error('Database operation failed', 400));
  }

  // Log unknown errors for debugging
  console.error(`[SERVER ERROR][ID: ${requestId}]:`, JSON.stringify(err, Object.getOwnPropertyNames(err)));

  return res.status(500).json({
    ...error('Internal server error', 500),
    requestId
  });
};
