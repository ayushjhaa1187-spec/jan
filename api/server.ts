// Re-export the Express app from src for Vercel API routes compatibility
// This file exists for backwards compatibility with the old vercel.json config
import app from '../src/index';

export default app;
