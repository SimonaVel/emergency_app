import { Router, type Request, type Response } from "express";
import {
  createReporter,
  deleteReporter,
  getAllReporters,
  getReporterById,
  updateReporter,
} from "../../service/reporterService.js";
import { RecordNotFoundException } from "../../exceptions/RecordNotFoundException.js";

export const reporterRouter = Router();

// GET /api/reporters - list all reporters
reporterRouter.get("/", async (req: Request, res: Response) => {
  const { name, phoneNumber } = req.query;

  if (name !== undefined || phoneNumber !== undefined) {
    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      res
        .status(400)
        .json({ error: 'Query parameter "name" must be a non-empty string' });
      return;
    }

    if (
      phoneNumber !== undefined &&
      (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0)
    ) {
      res.status(400).json({
        error: 'Query parameter "phoneNumber" must be a non-empty string',
      });
      return;
    }
  }

  try {
    const reporters = await getAllReporters();
    res.json(reporters.map((reporter) => reporter.toJSON()));
  } catch (error) {
    console.error("Failed to fetch reporters: ", error);
    res.status(500).json({ error: "Failed to fetch reporters" });
  }
});

// GET /api/reporters/:id - get a specific reporter by ID
reporterRouter.get("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const reporter = await getReporterById(id);
    if (!reporter) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }
    res.json(reporter.toJSON());
  } catch (error) {
    console.error("Failed to fetch reporter:", error);
    res.status(500).json({ error: "Failed to fetch reporter" });
  }
});

// POST /api/reporters - create a new Reporter { name : string, phoneNumber : string}
reporterRouter.post("/", async (req: Request, res: Response) => {
  const { name, phoneNumber } = req.body;

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: 'Request body parameter "name" must be a non-empty string',
    });
    return;
  }

  if (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0) {
    res.status(400).json({
      error: 'Request body parameter "phoneNumber" must be a non-empty string',
    });
    return;
  }

  try {
    const newReporter = await createReporter(name, phoneNumber);
    res.status(201).json(newReporter.toJSON());
  } catch (error) {
    console.error("Failed to create reporter:", error);
    res.status(500).json({ error: "Failed to create reporter" });
  }
});

// PUT /api/reporters/:id - update an existing Reporter { name : string, phoneNumber : string}
reporterRouter.put("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;
  const { name, phoneNumber } = req.body ?? {};

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  const hasName = name !== undefined;
  const hasPhoneNumber = phoneNumber !== undefined;

  if (!hasName && !hasPhoneNumber) {
    res.status(400).json({
      error: 'Request body must include "name" or "phoneNumber"',
    });
    return;
  }

  if (hasName && (typeof name !== "string" || name.trim().length === 0)) {
    res.status(400).json({
      error: 'Request body parameter "name" must be a non-empty string',
    });
    return;
  }

  if (
    hasPhoneNumber &&
    (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0)
  ) {
    res.status(400).json({
      error: 'Request body parameter "phoneNumber" must be a non-empty string',
    });
    return;
  }

  try {
    const reporter = await getReporterById(id);
    if (!reporter) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }

    const updatedReporter = await updateReporter(
      id,
      hasName ? name.trim() : reporter.name,
      hasPhoneNumber ? phoneNumber.trim() : reporter.phoneNumber,
    );
    if (!updatedReporter) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }
    res.json(updatedReporter.toJSON());
  } catch (error) {
    console.error("Failed to update reporter:", error);
    res.status(500).json({ error: "Failed to update reporter" });
  }
});

// DELETE /api/reporters/:id - delete a reporter by ID
reporterRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

  try {
    const reporter = await getReporterById(id);
    if (!reporter) {
      res.status(404).json({ error: RecordNotFoundException.defaultMessage });
      return;
    }

    await deleteReporter(id);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete reporter:", error);
    res.status(500).json({ error: "Failed to delete reporter" });
  }
});