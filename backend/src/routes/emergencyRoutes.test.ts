import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../server.js';
import { pool } from '../database/pool.js';

const app = createServer();

beforeEach(async () => {
  // `emergencies` has a FK on `emergency_types`, so its (seeded) rows must
  // go first before the types table can be cleared for a clean slate.
  await pool.query('DELETE FROM emergencies');
  await pool.query('DELETE FROM emergency_types');
  await pool.query('ALTER TABLE emergency_types AUTO_INCREMENT = 1');
});

afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/emergencyTypes', () => {
  it('returns an empty array when none exist', async () => {
    const res = await request(app).get('/api/emergencyTypes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all emergency types, most recently created first', async () => {
    await request(app).post('/api/emergencyTypes').send({ name: 'Fire' });
    await request(app).post('/api/emergencyTypes').send({ name: 'Flood' });

    const res = await request(app).get('/api/emergencyTypes');

    expect(res.status).toBe(200);
    expect(res.body.map((e: { name: string }) => e.name)).toEqual(['Flood', 'Fire']);
  });
});

describe('GET /api/emergencyTypes/:id', () => {
  it('returns the emergency type when it exists', async () => {
    const created = await request(app).post('/api/emergencyTypes').send({ name: 'Fire' });

    const res = await request(app).get(`/api/emergencyTypes/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'Fire' });
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).get('/api/emergencyTypes/999999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency not found' });
  });
});

describe('POST /api/emergencyTypes', () => {
  it('creates a new emergency type', async () => {
    const res = await request(app).post('/api/emergencyTypes').send({ name: 'Earthquake' });

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.name).toBe('Earthquake');

    const fetched = await request(app).get(`/api/emergencyTypes/${res.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.name).toBe('Earthquake');
  });

  it('trims whitespace from the name', async () => {
    const res = await request(app).post('/api/emergencyTypes').send({ name: '  Storm  ' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Storm');
  });

  it.each([
    ['missing field', {}],
    ['empty string', { name: '' }],
    ['whitespace only', { name: '   ' }],
    ['non-string', { name: 123 }],
    ['null', { name: null }],
  ])('rejects a request with %s', async (_label, body) => {
    const res = await request(app).post('/api/emergencyTypes').send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Field "name" is required and must be a non-empty string' });
  });
});

describe('PUT /api/emergencyTypes/:id', () => {
  it('updates an existing emergency type', async () => {
    const created = await request(app).post('/api/emergencyTypes').send({ name: 'Fire' });

    const res = await request(app).put(`/api/emergencyTypes/${created.body.id}`).send({ name: 'Wildfire' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'Wildfire' });
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).put('/api/emergencyTypes/999999').send({ name: 'Wildfire' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency type not found' });
  });

  it('rejects an invalid name', async () => {
    const created = await request(app).post('/api/emergencyTypes').send({ name: 'Fire' });

    const res = await request(app).put(`/api/emergencyTypes/${created.body.id}`).send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/emergencyTypes/:id', () => {
  it('deletes an existing emergency type', async () => {
    const created = await request(app).post('/api/emergencyTypes').send({ name: 'Fire' });

    const res = await request(app).delete(`/api/emergencyTypes/${created.body.id}`);
    expect(res.status).toBe(204);

    const fetched = await request(app).get(`/api/emergencyTypes/${created.body.id}`);
    expect(fetched.status).toBe(404);
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).delete('/api/emergencyTypes/999999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency type not found' });
  });
});
