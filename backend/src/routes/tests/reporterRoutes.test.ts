import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "../../server.js";
import { pool } from "../../database/pool.js";

const app = createServer();

async function createReporter(name: string, phoneNumber: string) {
  const response = await request(app)
    .post("/api/reporters")
    .send({ name, phoneNumber });
  expect(response.status).toBe(201);
  return response.body.id as number;
}

beforeEach(async () => {
  await pool.query("DELETE FROM reporters");
  await pool.query("ALTER TABLE reporters AUTO_INCREMENT = 1");
});

afterAll(async () => {
  await pool.end();
});

describe("PUT /api/reporters/:id", () => {
  it("updates the name and keeps the existing phone number", async () => {
    const reporterId = await createReporter("Alex Example", "+359 888 111 222");

    const response = await request(app)
      .put(`/api/reporters/${reporterId}`)
      .send({ name: "Alex Updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: reporterId,
      name: "Alex Updated",
      phoneNumber: "+359 888 111 222",
    });
  });

  it("updates the phone number and keeps the existing name", async () => {
    const reporterId = await createReporter("Alex Example", "+359 888 111 222");

    const response = await request(app)
      .put(`/api/reporters/${reporterId}`)
      .send({ phoneNumber: "+359 888 333 444" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: reporterId,
      name: "Alex Example",
      phoneNumber: "+359 888 333 444",
    });
  });

  it("rejects a request with neither field", async () => {
    const reporterId = await createReporter("Alex Example", "+359 888 111 222");

    const response = await request(app)
      .put(`/api/reporters/${reporterId}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Request body must include "name" or "phoneNumber"',
    });
  });
});
