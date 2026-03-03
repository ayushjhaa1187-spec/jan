import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import adminEventRoutes from './routes/adminEventRoutes';
import teamRoutes from './routes/teamRoutes';
import adminRegistrationRoutes from './routes/adminRegistrationRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Load Swagger document
try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    // Swagger UI Endpoint
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
    console.warn('[Warning] Failed to load swagger.yaml. /api-docs will be unavailable.');
}

// Simple Request Logger
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // to match /api/users/me
app.use('/api/events', eventRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin/registrations', adminRegistrationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running' });
});

// 404 Handler for API
app.use('/api', (req: express.Request, res: express.Response) => {
    res.status(404).json({
        error: 'NotFound',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'Something went wrong on our end.',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server only if not in test environment and not on Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;
