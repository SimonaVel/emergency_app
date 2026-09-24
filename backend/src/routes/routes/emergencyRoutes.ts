import { Router, type Request, type Response } from 'express';
import { createEmergency, getAllEmergencies, getEmergencyById, getEmergencyByName, updateEmergency, deleteEmergency } from '../../service/emergencyService.js'
import { getEmergencyTypeById, getEmergencyTypeByName } from '../../service/emergencyTypeService.js';
import { DEFAULT_EMERGENCY_TYPE_NAME } from '../../config/parameters.js';

export const emergencyRouter = Router();

// GET /api/emergencies - list all emergencies
// GET /api/emergencies?name=X - get a specific emergency by name
emergencyRouter.get('/', async (req: Request, res: Response) => {
  const { name } = req.query;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "name" must be a non-empty string' });
      return;
    }

    try {
      const emergency = await getEmergencyByName(name);
      if (!emergency) {
        res.status(404).json({ error: 'Emergency not found' });
        return;
      }
      res.json(emergency.toJSON());
    } catch (error) {
      console.error('Failed to fetch emergency:', error);
      res.status(500).json({ error: 'Failed to fetch emergency' });
    }
    return;
  }

  try {
    const emergencies = await getAllEmergencies();
    res.json(emergencies.map((emergency) => emergency.toJSON()));
  } catch (error) {
    console.error('Failed to fetch emergencies: ', error);
    res.status(500).json({ error: 'Fialed to fetch emergencies'});
  }
});


// GET /api/emergencies/:id - get a specific emergency by ID
emergencyRouter.get('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const emergency = await getEmergencyById(id);
    if (!emergency) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }
    res.json(emergency.toJSON());
  } catch (error) {
    console.error('Failed to fetch emergency:', error);
    res.status(500).json({ error: 'Failed to fetch emergency' });
  }
});

// POST api/emergencies - create a new Emergency { name : string, emergencyType : number}
emergencyRouter.post('/', async (req: Request, res: Response) => {
  const { name, emergencyType } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  let emergencyTypeId: number | null = null;
  if (emergencyType !== undefined && emergencyType !== null) {
    if (typeof emergencyType !== 'number' || !Number.isInteger(emergencyType)) {
      res.status(400).json({ error: 'Field "emergencyType" must be an integer id' });
      return;
    }
    emergencyTypeId = emergencyType;
  }

  try {
    if (emergencyTypeId === null) {
      const otherType = await getEmergencyTypeByName(DEFAULT_EMERGENCY_TYPE_NAME);
      if (!otherType) {
        res.status(500).json({ error: 'Default emergency type is not configured' });
        return;
      }
      emergencyTypeId = otherType.id;
    } else {
      const existingType = await getEmergencyTypeById(emergencyTypeId);
      if (!existingType) {
        res.status(400).json({ error: 'Emergency type not found' });
        return;
      }
    }

    const emergency = await createEmergency(name.trim(), emergencyTypeId);
    res.status(201).json(emergency.toJSON());
  } catch (error) {
    console.error('Failed to create emergency:', error);
    res.status(500).json({ error: 'Failed to create emergency' });
  }
});

// UPDATE /api/emergencies/:id - update an existing emergency { name?: string, emergencyType?: number | null }
emergencyRouter.put('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;
  const { name, emergencyType } = req.body ?? {};

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'URL parameter "id" must be an integer' });
    return;
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    res.status(400).json({ error: 'Field "name" must be a non-empty string' });
    return;
  }

  // undefined = leave unchanged, null = clear the type, number = set the type
  if (emergencyType !== undefined && emergencyType !== null &&
      (typeof emergencyType !== 'number' || !Number.isInteger(emergencyType))) {
    res.status(400).json({ error: 'Field "emergencyType" must be an integer id or null' });
    return;
  }

  try {
    const existing = await getEmergencyById(id);
    if (!existing) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }

    const finalName = name !== undefined ? name.trim() : existing.name;
    const finalEmergencyTypeId: number | null = emergencyType !== undefined
      ? emergencyType
      : (existing.emergencyType ? existing.emergencyType.id : null);

    if (finalEmergencyTypeId !== null && !(await getEmergencyTypeById(finalEmergencyTypeId))) {
      res.status(400).json({ error: 'Emergency type not found' });
      return;
    }

    const emergency = await updateEmergency(id, finalName, finalEmergencyTypeId);
    if (!emergency) {
      res.status(404).json({ error: 'Emergency not found' });
      return;
    }
    res.json({ id: emergency.id, name: emergency.name, emergencyType: finalEmergencyTypeId });
  } catch (error) {
    console.error('Failed to update emergency:', error);
    res.status(500).json({ error: 'Failed to update emergency' });
  }
});

// DELETE /api/emergencies/:id - delete an existing emergency
emergencyRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

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
