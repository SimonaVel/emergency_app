import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../database/pool.js';
import { EmergencyType } from '../models/EmergencyType.js';

interface EmergencyTypeRow extends RowDataPacket {
  id: number;
  name: string;
}

const table = 'emergency_types';

export async function createEmergencyType(name: string): Promise<EmergencyType> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`${table}\` (name) VALUES (?)`,
    [name]
  );
  return new EmergencyType(result.insertId, name);
}

export async function getAllEmergencyTypes(): Promise<EmergencyType[]> {
  const [rows] = await pool.query<EmergencyTypeRow[]>(
    `SELECT id, name FROM \`${table}\` ORDER BY id DESC`
  );
  return rows.map((row) => new EmergencyType(row.id, row.name));
}

export async function getEmergencyTypeById(id: number): Promise<EmergencyType | null> {
  const [rows] = await pool.query<EmergencyTypeRow[]>(
    `SELECT id, name FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  const row = rows[0];
  return row ? new EmergencyType(row.id, row.name) : null;
}

export async function getEmergencyTypeByName(name: string): Promise<EmergencyType | null> {
  const [rows] = await pool.query<EmergencyTypeRow[]>(
    `SELECT id, name FROM \`${table}\` WHERE name = ?`,
    [name]
  );
  const row = rows[0];
  return row ? new EmergencyType(row.id, row.name) : null;
}

export async function updateEmergencyType(id: number, name: string): Promise<EmergencyType | null> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE \`${table}\` SET name = ? WHERE id = ?`,
    [name, id]
  );
  if (result.affectedRows === 0) {
    return null; // No emergency type found with the given ID
  }
  return new EmergencyType(id, name);
}

export async function deleteEmergencyType(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}