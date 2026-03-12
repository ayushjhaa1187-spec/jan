import { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers to catch errors automatically
 * Prevents unhandled promise rejections that cause FUNCTION_INVOCATION_FAILED on Vercel
 * 
 * Usage:
 * router.get('/endpoint', asyncHandler(async (req, res) => {
 *   // Your async code here
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
