import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import prisma from './utils/prisma';

const app = express();

// Security: Security Headers
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS
app.use(cors());

app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
try {
  const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error('Failed to load swagger documentation:', error);
}

// Static files
const appRoot = process.cwd();
app.use('/admin_pages', express.static(path.resolve(appRoot, 'admin_pages')));
app.use('/participant_pages', express.static(path.resolve(appRoot, 'participant_pages')));
app.use('/public', express.static(path.resolve(appRoot, 'public')));

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'OK',
      message: 'API and Database are healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'Error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'EduTrack API is running',
    version: '1.1.1',
    docs: '/api',
    health: '/api/health',
  });
});

// API index — lists all available endpoints
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'EduTrack Examination Management System API',
    version: '1.1.1',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      classes: '/api/classes',
      subjects: '/api/subjects',
      teachers: '/api/teachers',
      teacherSubjects: '/api/teacher-subjects',
      exams: '/api/exams',
      marks: '/api/marks',
      results: '/api/results',
      reports: '/api/reports',
      notifications: '/api/notifications',
      audit: '/api/audit',
    },
  });
});

// Mount all API routes
app.use('/api', apiRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    statusCode: 404,
  });
});

// Error handler middleware
app.use(errorHandler);

// Global error handlers for Vercel serverless
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('[CRITICAL] Unhandled Promise Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString(),
  });
});

process.on('uncaughtException', (error: Error) => {
  console.error('[CRITICAL] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});

export default app;
