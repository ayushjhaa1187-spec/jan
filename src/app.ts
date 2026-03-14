import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security: Security Headers
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Security: CORS (Configure for production in the future via env)
app.use(cors());

app.use(express.json());
app.use(cookieParser());

// Basic CSRF defense: Origin verification for non-GET requests in production
app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONTEND_URL];
  const origin = req.get('origin');
  
  if (
    process.env.NODE_ENV === 'production' && 
    req.method !== 'GET' && 
    origin && 
    !allowedOrigins.includes(origin)
  ) {
    // Note: This is a basic check. For full CSRF, use synchronizer tokens if using cookies for auth.
    // For JWT in headers, this is secondary protection.
  }
  next();
});


// Health check
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'EduTrack API is running',
    version: '1.0.0',
    docs: '/api',
    health: 'OK',
  });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'EduTrack Examination Management System API',
    version: '1.0.0',
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

app.use('/api', apiRoutes);

app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    statusCode: 404,
  });
});

app.use(errorHandler);

export default app;
