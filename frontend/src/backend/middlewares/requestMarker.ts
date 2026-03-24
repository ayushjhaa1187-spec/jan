import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add a unique X-Request-ID to every request and response.
 * This is the gold standard for Observability and distributed tracing.
 */
export const requestMarker = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Attach to request for logging downstream
  (req as any).requestId = requestId;
  
  // Send in response headers so clients can report it for debugging
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Access the request ID in other middlewares or services
 */
export const getRequestId = (req: Request) => (req as any).requestId;
