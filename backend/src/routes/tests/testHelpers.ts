import { expect } from "vitest";
import request from "supertest";
import type { createServer } from "../../server.js";

type TestApp = ReturnType<typeof createServer>;

async function createNamedResource(
  app: TestApp,
  endpoint: "/api/emergencyTypes" | "/api/incidentStatuses",
  name: string,
): Promise<number> {
  const response = await request(app).post(endpoint).send({ name });
  expect(response.status).toBe(201);
  return response.body.id as number;
}

export function createEmergencyType(app: TestApp, name: string) {
  return createNamedResource(app, "/api/emergencyTypes", name);
}

export function createIncidentStatus(app: TestApp, name: string) {
  return createNamedResource(app, "/api/incidentStatuses", name);
}