import { Router, type Request, type Response } from 'express';
import { createEmergency, getAllEmergencies } from '../services/emergencyService.js';

export const emergencyRouter = Router();

// GET /api/emergencies - list all emergencies
emergencyRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const emergencies = await getAllEmergencies();
    res.json(emergencies.map((emergency) => emergency.toJSON()));
  } catch (error) {
    console.error('Failed to fetch emergencies:', error);
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
});

// POST /api/emergencies - create a new emergency { name: string }
emergencyRouter.post('/', async (req: Request, res: Response) => {
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  try {
    const emergency = await createEmergency(name.trim());
    res.status(201).json(emergency.toJSON());
  } catch (error) {
    console.error('Failed to create emergency:', error);
    res.status(500).json({ error: 'Failed to create emergency' });
  }
});
