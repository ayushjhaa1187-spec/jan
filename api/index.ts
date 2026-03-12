import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless API Handler
 * Routes all API requests to the Express backend
 */
export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    // Dynamically import the compiled Express app
    const { default: app } = await import('../dist/app');
    
    // Pass the request through Express middleware
    return new Promise((resolve) => {
      app(req, res);
      
      // Ensure response is sent
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      
      // Timeout fallback
      setTimeout(() => resolve(), 30000);
    });
  } catch (error) {
    console.error('[API Handler] Error:', error);
    
    // Handle error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FUNCTION_INVOCATION_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
};
