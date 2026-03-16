import { Request, Response, NextFunction } from 'express';

/**
 * Edge Caching Middleware (SaaS-Native)
 * Optimized for Vercel Edge/CDN.
 * 
 * Sets Surrogate-Control and Cache-Control headers based on organization context.
 * This ensures that common institutional data (like subject catalogs) is cached 
 * close to the user while maintaining tenant isolation via 'Vary: X-Org-ID'.
 */
export const edgeCache = (seconds = 60) => (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') return next();

  const orgId = (req as any).user?.orgId;
  
  if (orgId) {
    // Shared Cache (CDN) with Tenant Isolation
    // Stale-while-revalidate allows for background updates without blocking the user
    res.setHeader('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${seconds / 2}`);
    res.setHeader('Vary', 'X-Auth-Token, Origin, X-Org-ID');
  } else {
    // Private cache for non-authenticated or generic routes
    res.setHeader('Cache-Control', 'private, no-cache');
  }

  next();
};
