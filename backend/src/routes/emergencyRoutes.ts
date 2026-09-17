import { Router, type Request, type Response } from 'express';
import { createEmergency, getAllEmergencies, updateEmergency, deleteEmergency } from '../services/emergencyService.js';

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

// UPDATE /api/emergencies/:id - update an existing emergency { name: string }
emergencyRouter.put('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
  
  try {
    const emergency = await updateEmergency(id, name.trim());
    if (!emergency) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }
    res.json(emergency.toJSON());
  } catch (error) {
    console.error('Failed to update emergency:', error);
    res.status(500).json({ error: 'Failed to update emergency' });
  }
});

// DELETE /api/emergencies/:id - delete an existing emergency
emergencyRouter.delete('/:id', async (req: Request, res: Response) => {
  const { rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const success = await deleteEmergency(id);
    if (!success) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete emergency:', error);
    res.status(500).json({ error: 'Failed to delete emergency' });
  }
});
