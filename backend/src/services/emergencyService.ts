import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { Emergency } from '../models/Emergency.js';

interface EmergencyRow extends RowDataPacket {
  id: number;
  name: string;
}

const table = env.mysql.emergenciesTable;

export async function createEmergency(name: string): Promise<Emergency> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`${table}\` (name) VALUES (?)`,
    [name]
  );
  return new Emergency(result.insertId, name);
}

export async function getAllEmergencies(): Promise<Emergency[]> {
  const [rows] = await pool.query<EmergencyRow[]>(
    `SELECT id, name FROM \`${table}\` ORDER BY id DESC`
  );
  return rows.map((row) => new Emergency(row.id, row.name));
}

export async function getEmergencyById(id: number): Promise<Emergency | null> {
  const [rows] = await pool.query<EmergencyRow[]>(
    `SELECT id, name FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  const row = rows[0];
  return row ? new Emergency(row.id, row.name) : null;
}
