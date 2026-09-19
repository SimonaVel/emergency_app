import express from 'express';
import cors from 'cors';
import { emergencyTypeRouter } from './routes/emergencyTypeRoutes.js';
import { emergencyRouter } from './routes/emergencyRoutes.js';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/emergencyTypes', emergencyTypeRouter);
  app.use('/api/emergencies', emergencyRouter);

  return app;
}
