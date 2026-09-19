import express from 'express';
import cors from 'cors';
import { emergencyTypeRouter } from './routes/emergencyTypeRoutes.js';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/emergencyTypes', emergencyTypeRouter);

  return app;
}
