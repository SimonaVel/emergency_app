import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "../../server.js";
import { pool } from "../../database/pool.js";
import { RecordNotFoundException } from "../../exceptions/RecordNotFoundException.js";

const app = createServer();

beforeEach(async () => {
  await pool.query("DELETE FROM incident_statuses");
  await pool.query("ALTER TABLE incident_statuses AUTO_INCREMENT = 1");
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/incidentStatuses", () => {
  it("returns an empty array when none exist", async () => {
    const res = await request(app).get("/api/incidentStatuses");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all incident statuses (ASC)", async () => {
    await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Investigated" });
    await request(app).post("/api/incidentStatuses").send({ name: "Reported" });

    const res = await request(app).get("/api/incidentStatuses");

    expect(res.status).toBe(200);
    expect(res.body.map((e: { name: string }) => e.name)).toEqual([
      "Investigated",
      "Reported",
    ]);
  });
});

describe("GET /api/incidentStatuses/:id", () => {
  it("returns the incident status when it exists", async () => {
    const created = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Investigated" });

    const res = await request(app).get(
      `/api/incidentStatuses/${created.body.id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: "Investigated" });
  });

  it("returns 404 when the id does not exist", async () => {
    const res = await request(app).get("/api/incidentStatuses/999999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: RecordNotFoundException.defaultMessage });
  });
});

describe("GET /api/incidentStatuses?name=X", () => {
  it("returns the incident status when name exists", async () => {
    const name = "Reported";
    await request(app).post("/api/incidentStatuses").send({ name: name });

    const res = await request(app).get(`/api/incidentStatuses?name=${name}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toEqual("Reported");
  });

  it("returns the incident status when name does not exist", async () => {
    const name = "Reported";
    await request(app).post("/api/incidentStatuses").send({ name: name });

    const res = await request(app).get(`/api/incidentStatuses?name=Not${name}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: RecordNotFoundException.defaultMessage });
  });
});

describe("POST /api/incidentStatuses", () => {
  it("creates a new incident status", async () => {
    const res = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Submitted" });

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe("number");
    expect(res.body.name).toBe("Submitted");

    const fetched = await request(app).get(
      `/api/incidentStatuses/${res.body.id}`,
    );
    expect(fetched.status).toBe(200);
    expect(fetched.body.name).toBe("Submitted");
  });

  it("trims whitespace from the name", async () => {
    const res = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "  Rejected  " });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Rejected");
  });
});

describe("PUT /api/incidentStatuses/:id", () => {
  it("updates an existing incident status", async () => {
    const created = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Submitted" });

    const res = await request(app)
      .put(`/api/incidentStatuses/${created.body.id}`)
      .send({ name: "Rejected" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: "Rejected" });
  });

  it("returns 404 when the id does not exist", async () => {
    const res = await request(app)
      .put("/api/incidentStatuses/999999")
      .send({ name: "Rejected" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: RecordNotFoundException.defaultMessage });
  });

  it("rejects an invalid name", async () => {
    const created = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Submitted" });

    const res = await request(app)
      .put(`/api/incidentStatuses/${created.body.id}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/incidentStatuses/:id", () => {
  it("deletes an existing incident status", async () => {
    const created = await request(app)
      .post("/api/incidentStatuses")
      .send({ name: "Submitted" });

    const res = await request(app).delete(
      `/api/incidentStatuses/${created.body.id}`,
    );
    expect(res.status).toBe(204);

    const fetched = await request(app).get(
      `/api/incidentStatuses/${created.body.id}`,
    );
    expect(fetched.status).toBe(404);
  });

  it("returns 404 when the id does not exist", async () => {
    const res = await request(app).delete("/api/incidentStatuses/999999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: RecordNotFoundException.defaultMessage });
  });
});
