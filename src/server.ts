import 'dotenv/config';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import app from './app';
import prisma from './utils/prisma';

try {
  const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  // no-op
}

const appRoot = path.join(__dirname, '..');
const publicPath = path.resolve(appRoot, 'public');
const adminPagesPath = path.resolve(appRoot, 'admin_pages');
app.use('/admin_pages', express.static(adminPagesPath));
app.use('/participant_pages', express.static(path.resolve(appRoot, 'participant_pages')));
app.use('/public', express.static(publicPath));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'OK', message: 'API and Database are healthy', timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: 'Error', message: 'Database connection failed', timestamp: new Date().toISOString() });
  }
});

/**
 * CRITICAL: Global error handlers for Vercel serverless
 * These prevent FUNCTION_INVOCATION_FAILED errors by catching unhandled rejections
 * and uncaught exceptions at the process level.
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('[CRITICAL] Unhandled Promise Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString(),
  });
  
  // In serverless environments, log and continue
  // The error middleware in Express will handle the actual HTTP response
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('[CRITICAL] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // In serverless environments, we should attempt to gracefully handle this
  // However, if an exception reaches this point, the function is in an unstable state
  // Log it and let the request be handled by the error middleware if possible
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
