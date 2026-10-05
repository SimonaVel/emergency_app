import { Router, type Request, type Response } from "express";
import {
  createIncidentStatus,
  getIncidentStatusByName,
  getAllIncidentStatuses,
  getIncidentStatusById,
  updateIncidentStatus,
  deleteIncidentStatus,
} from "../../service/incidentStatusService.js";
import { RecordNotFoundException } from "../../exceptions/RecordNotFoundException.js";

export const incidentStatusRouter = Router();

// GET /api/incidentStatuses - list all incidentStatuses
// GET /api/incidentStatuses?name=X - get an incidentStatus by name
incidentStatusRouter.get("/", async (req: Request, res: Response) => {
  const { name } = req.query;
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      res
        .status(400)
        .json({ error: 'Query parameter "name" must be a non-empty string' });
      return;
    }
    try {
      const incidentStatus = await getIncidentStatusByName(name);
      if (!incidentStatus) {
        res.status(404).json({ error: RecordNotFoundException.defaultMessage });
        return;
      }
      res.json(incidentStatus.toJSON());
    } catch (error) {
      console.error("Failed to fetch incident status:", error);
      res.status(500).json({ error: "Failed to fetch incident status" });
    }
    return;
  }

  try {
    const incidentStatuses = await getAllIncidentStatuses();
    res.json(incidentStatuses.map((incidentStatus) => incidentStatus.toJSON()));
  } catch (error) {
    console.error("Failed to fetch incident statuses:", error);
    res.status(500).json({ error: "Failed to fetch incident stauses" });
  }
});

// GET /api/incidentStatuses/:id - get a specific incidentStatus by ID
incidentStatusRouter.get("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const incidentStatus = await getIncidentStatusById(id);
    if (!incidentStatus) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }
    res.json(incidentStatus.toJSON());
  } catch (error) {
    console.error("Failed to fetch incident status:", error);
    res.status(500).json({ error: "Failed to fetch incident status" });
  }
});

// POST /api/incidentStatuses - create a new incidentStatus { name: string }
incidentStatusRouter.post("/", async (req: Request, res: Response) => {
  const { name } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res
      .status(400)
      .json({
        error: 'Field "name" is required and must be a non-empty string',
      });
    return;
  }

  try {
    const incidentStatus = await createIncidentStatus(name.trim());
    res.status(201).json(incidentStatus.toJSON());
  } catch (error) {
    console.error("Failed to create incident status:", error);
    res.status(500).json({ error: "Failed to create incident status" });
  }
});

// UPDATE /api/incidentStatuses/:id - update an existing incidentStatus { name: string }
incidentStatusRouter.put("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;
  const { name } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res
      .status(400)
      .json({
        error: 'Field "name" is required and must be a non-empty string',
      });
    return;
  }

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const incidentStatus = await updateIncidentStatus(id, name.trim());
    if (!incidentStatus) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }
    res.json(incidentStatus.toJSON());
  } catch (error) {
    console.error("Failed to update incidentStatus:", error);
    res.status(500).json({ error: "Failed to update incidentStatus" });
  }
});

// DELETE /api/incidentStatuses/:id - delete an existing incidentStatus
incidentStatusRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const success = await deleteIncidentStatus(id);
    if (!success) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete incidentStatus:", error);
    res.status(500).json({ error: "Failed to delete incidentStatus" });
  }
});
