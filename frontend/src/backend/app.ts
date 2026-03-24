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
import { requestMarker } from './middlewares/requestMarker';
import prisma from './utils/prisma';

const app = express();

// 0. Request Instrumentation (Distributed Tracing)
app.use(requestMarker);

// 1. CORS - PRODUCTION HARDENING
const allowedOrigins = [
  'https://jan-two.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Auth-Token'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.options('*', cors()); 

// 2. Security Headers (CSP Hardened)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.vercel-scripts.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:*"],
        connectSrc: ["'self'", "https:*"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }),
);

// 3. Rate Limiting (Tiered)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes - Brute Force Protection
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

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

// Static files - Optimized with Cache-Control for Edge delivery
const appRoot = process.cwd();
const STATIC_CACHE_MAX_AGE = 'public, max-age=31536000, immutable'; // 1 year for versioned/static assets

app.use('/admin_pages', express.static(path.resolve(appRoot, 'admin_pages'), { maxAge: '1y' }));
app.use('/participant_pages', express.static(path.resolve(appRoot, 'participant_pages'), { maxAge: '1y' }));
app.use('/public', express.static(path.resolve(appRoot, 'public'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', STATIC_CACHE_MAX_AGE);
  }
}));

// Health check endpoint with Latency Tracking
app.get(['/api/health', '/health'], async (req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;
    
    return res.json({
      status: 'OK',
      message: 'API and Database are healthy',
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
      metrics: {
        dbLatency: `${dbLatency}ms`
      }
    });
  } catch (error) {
    return res.status(503).json({
      status: 'Error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId
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
app.use('/api-proxy', apiRoutes);
app.use('/', apiRoutes);

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
