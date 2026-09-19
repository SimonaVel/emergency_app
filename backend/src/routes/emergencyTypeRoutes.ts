import { Router, type Request, type Response } from 'express';
import { createEmergencyType, getAllEmergencyTypes, updateEmergencyType, deleteEmergencyType, getEmergencyTypeById } from '../services/emergencyService.js';

export const emergencyTypeRouter = Router();

// GET /api/emergencyTypes - list all emergencyTypes
emergencyTypeRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const emergencyTypes = await getAllEmergencyTypes();
    res.json(emergencyTypes.map((emergencyType) => emergencyType.toJSON()));
  } catch (error) {
    console.error('Failed to fetch emergencyType types:', error);
    res.status(500).json({ error: 'Failed to fetch emergencyType types' });
  }
});

// GET /api/emergencyTypes/:id - get a specific emergencyType by ID
emergencyTypeRouter.get('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const emergencyType = await getEmergencyTypeById(id);
    if (!emergencyType) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }
    res.json(emergencyType.toJSON());
  } catch (error) {
    console.error('Failed to fetch emergencyType:', error);
    res.status(500).json({ error: 'Failed to fetch emergencyType' });
  }
});

// POST /api/emergencyTypes - create a new emergencyType { name: string }
emergencyTypeRouter.post('/', async (req: Request, res: Response) => {
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  try {
    const emergencyType = await createEmergencyType(name.trim());
    res.status(201).json(emergencyType.toJSON());
  } catch (error) {
    console.error('Failed to create emergencyType:', error);
    res.status(500).json({ error: 'Failed to create emergencyType' });
  }
});

// UPDATE /api/emergencyTypes/:id - update an existing emergencyType { name: string }
emergencyTypeRouter.put('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
  
  try {
    const emergencyType = await updateEmergencyType(id, name.trim());
    if (!emergencyType) {
      res.status(404).json({ error: 'Emergency type not found' });
      return;
    }
    res.json(emergencyType.toJSON());
  } catch (error) {
    console.error('Failed to update emergencyType type:', error);
    res.status(500).json({ error: 'Failed to update emergencyType type' });
  }
});

// DELETE /api/emergencyTypes/:id - delete an existing emergencyType
emergencyTypeRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const success = await deleteEmergencyType(id);
    if (!success) {
      res.status(404).json({ error: 'Emergency type not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete emergencyType:', error);
    res.status(500).json({ error: 'Failed to delete emergencyType' });
  }
});
