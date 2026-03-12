import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(express.json());


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
