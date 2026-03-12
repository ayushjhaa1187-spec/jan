import 'dotenv/config';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import app from './app';
import prisma from './utils/prisma';

const PORT = process.env.PORT || 5000;

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

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

export default app;
