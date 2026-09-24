import { Router, type Request, type Response } from 'express';
import { getIncidentStatusByName, getAllIncidentStatuses, getIncidentStatusById } from '../../service/incidentStatusService.js'

export const incidentStatusRouter = Router();

// GET /api/incidentStatuses - list all incidentStatuses
// GET /api/incidentStatuses?name=X - get an incidentStatus by name
incidentStatusRouter.get('/', async (req: Request, res: Response) => {
  const { name } = req.query;
  if(name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "name" must be a non-empty string' });
      return;
    }
    try {
          const incidentStatus = await getIncidentStatusByName(name);
          if (!incidentStatus) {
            res.status(404).json({ error: 'Incident status not found' });
            return;
          }
          res.json(incidentStatus.toJSON());
        } catch (error) {
          console.error('Failed to fetch incident status:', error);
          res.status(500).json({ error: 'Failed to fetch incident status' });
        }
        return;
  }

  try {
    const incidentStatuses = await getAllIncidentStatuses();
    res.json(incidentStatuses.map((incidentStatus) => incidentStatus.toJSON()));
  } catch (error) {
    console.error('Failed to fetch incident statuses:', error);
    res.status(500).json({ error: 'Failed to fetch incident stauses' });
  }
});

// GET /api/incidentStatuses/:id - get a specific incidentStatus by ID
incidentStatusRouter.get('/:id', async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const incidentStatus = await getIncidentStatusById(id);
    if (!incidentStatus) {
      res.status(404).json({ error: 'Incident status not found' });
      return;
    }
    res.json(incidentStatus.toJSON());
  } catch (error) {
    console.error('Failed to fetch incident status:', error);
    res.status(500).json({ error: 'Failed to fetch incident status' });
  }
});
