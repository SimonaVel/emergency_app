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

async function createType(name: string) {
  const res = await request(app).post('/api/emergencyTypes').send({ name });
  return res.body.id as number;
}

describe('GET /api/emergencies', () => {
  it('returns an empty array when none exist', async () => {
    const res = await request(app).get('/api/emergencies');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all emergencies, most recently created first', async () => {
    const typeId = await createType('Fire');
    await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });
    await request(app).post('/api/emergencies').send({ name: 'Forest fire', emergencyType: typeId });

    const res = await request(app).get('/api/emergencies');

    expect(res.status).toBe(200);
    expect(res.body.map((e: { name: string }) => e.name)).toEqual(['Forest fire', 'House fire']);
  });
});

describe('GET /api/emergencies?name=X', () => {
  it('returns the emergency when the name exists', async () => {
    const typeId = await createType('Fire');
    await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).get('/api/emergencies?name=House fire');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('House fire');
    expect(res.body.emergencyType).toBe(typeId);
  });

  it('returns 404 when the name does not exist', async () => {
    const res = await request(app).get('/api/emergencies?name=Nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency not found' });
  });

  it('rejects an empty name query', async () => {
    const res = await request(app).get('/api/emergencies?name=');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Query parameter "name" must be a non-empty string' });
  });
});

describe('GET /api/emergencies/:id', () => {
  it('returns the emergency when it exists', async () => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).get(`/api/emergencies/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'House fire', emergencyType: typeId });
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).get('/api/emergencies/999999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency not found' });
  });
});

describe('POST /api/emergencies', () => {
  it('creates a new emergency with an explicit emergency type', async () => {
    const typeId = await createType('Fire');

    const res = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.name).toBe('House fire');
    expect(res.body.emergencyType).toBe(typeId);
  });

  it('defaults to the "Other" emergency type when none is given', async () => {
    const otherId = await createType('Other');

    const res = await request(app).post('/api/emergencies').send({ name: 'Unclassified incident' });

    expect(res.status).toBe(201);
    expect(res.body.emergencyType).toBe(otherId);
  });

  it('returns 500 when the default "Other" emergency type is not configured', async () => {
    const res = await request(app).post('/api/emergencies').send({ name: 'Unclassified incident' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Default emergency type is not configured' });
  });

  it('trims whitespace from the name', async () => {
    const typeId = await createType('Fire');

    const res = await request(app).post('/api/emergencies').send({ name: '  House fire  ', emergencyType: typeId });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('House fire');
  });

  it.each([
    ['missing field', {}],
    ['empty string', { name: '' }],
    ['whitespace only', { name: '   ' }],
    ['non-string', { name: 123 }],
    ['null', { name: null }],
  ])('rejects a request with %s name', async (_label, body) => {
    const res = await request(app).post('/api/emergencies').send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Field "name" is required and must be a non-empty string' });
  });

  it.each([
    ['a string', 'Fire'],
    ['a float', 1.5],
  ])('rejects %s emergencyType', async (_label, emergencyType) => {
    const res = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Field "emergencyType" must be an integer id' });
  });

  it('rejects an emergencyType id that does not exist', async () => {
    const res = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: 999999 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Emergency type not found' });
  });
});

describe('PUT /api/emergencies/:id', () => {
  it('updates the name and keeps the existing emergency type', async () => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send({ name: 'Kitchen fire' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'Kitchen fire', emergencyType: typeId });
  });

  it('updates the emergency type and keeps the existing name', async () => {
    const fireId = await createType('Fire');
    const floodId = await createType('Flood');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: fireId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send({ emergencyType: floodId });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'House fire', emergencyType: floodId });
  });

  it('updates both the name and the emergency type', async () => {
    const fireId = await createType('Fire');
    const floodId = await createType('Flood');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: fireId });

    const res = await request(app)
      .put(`/api/emergencies/${created.body.id}`)
      .send({ name: 'River flood', emergencyType: floodId });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'River flood', emergencyType: floodId });
  });

  it('clears the emergency type when emergencyType is null', async () => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send({ emergencyType: null });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'House fire', emergencyType: null });
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).put('/api/emergencies/999999').send({ name: 'Kitchen fire' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency not found' });
  });

  it('rejects an invalid URL id', async () => {
    const res = await request(app).put('/api/emergencies/not-a-number').send({ name: 'Kitchen fire' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'URL parameter "id" must be an integer' });
  });

  it.each([
    ['empty string', { name: '' }],
    ['whitespace only', { name: '   ' }],
    ['non-string', { name: 123 }],
  ])('rejects a request with %s name', async (_label, body) => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Field "name" must be a non-empty string' });
  });

  it.each([
    ['a string', 'Fire'],
    ['a float', 1.5],
  ])('rejects %s emergencyType', async (_label, emergencyType) => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send({ emergencyType });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Field "emergencyType" must be an integer id or null' });
  });

  it('rejects an emergencyType id that does not exist', async () => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).put(`/api/emergencies/${created.body.id}`).send({ emergencyType: 999999 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Emergency type not found' });
  });
});

describe('DELETE /api/emergencies/:id', () => {
  it('deletes an existing emergency', async () => {
    const typeId = await createType('Fire');
    const created = await request(app).post('/api/emergencies').send({ name: 'House fire', emergencyType: typeId });

    const res = await request(app).delete(`/api/emergencies/${created.body.id}`);
    expect(res.status).toBe(204);

    const fetched = await request(app).get(`/api/emergencies/${created.body.id}`);
    expect(fetched.status).toBe(404);
  });

  it('returns 404 when the id does not exist', async () => {
    const res = await request(app).delete('/api/emergencies/999999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Emergency not found' });
  });
});

