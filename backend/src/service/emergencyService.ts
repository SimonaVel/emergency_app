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

export async function updateEmergency(id: number, name: string): Promise<Emergency | null> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE \`${table}\` SET name = ? WHERE id = ?`,
    [name, id]
  );
  if (result.affectedRows === 0) {
    return null; // No emergency found with the given ID
  }
  return new Emergency(id, name);
}

export async function deleteEmergency(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}