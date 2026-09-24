import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../database/pool.js';
import { Emergency } from '../models/Emergency.js';
import { EmergencyType } from '../models/EmergencyType.js';

interface EmergencyRow extends RowDataPacket {
  id: number;
  name: string;
  emergencyTypeId: number | null;
}

const table = 'emergencies';

function toEmergency(row: EmergencyRow): Emergency {
  if (row.emergencyTypeId === null) {
    return new Emergency(row.id, row.name, null);
  }
  return new Emergency(row.id, row.name, new EmergencyType(row.emergencyTypeId));
}

export async function createEmergency(name: string, emergencyTypeId: number | null): Promise<Emergency> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`${table}\` (name, emergency_type_id) VALUES (?, ?)`,
    [name, emergencyTypeId]
  );
  return new Emergency(
    result.insertId,
    name,
    emergencyTypeId === null ? null : new EmergencyType(emergencyTypeId)
  );
}

export async function getAllEmergencies(): Promise<Emergency[]> {
  const [rows] = await pool.query<EmergencyRow[]>(
    `SELECT id, name, emergency_type_id AS emergencyTypeId FROM \`${table}\` ORDER BY id DESC`
  );
  return rows.map(toEmergency);
}

export async function getEmergencyById(id: number): Promise<Emergency | null> {
  const [rows] = await pool.query<EmergencyRow[]>(
    `SELECT id, name, emergency_type_id AS emergencyTypeId FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  const row = rows[0];
  return row ? toEmergency(row) : null;
}

export async function getEmergencyByName(name: string): Promise<Emergency | null> {
  const [rows] = await pool.query<EmergencyRow[]>(
    `SELECT id, name, emergency_type_id AS emergencyTypeId FROM \`${table}\` WHERE name = ?`,
    [name]
  );
  const row = rows[0];
  return row ? toEmergency(row) : null;
}

export async function updateEmergency(
  id: number,
  name: string,
  emergencyTypeId: number | null
): Promise<Emergency | null> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE \`${table}\` SET name = ?, emergency_type_id = ? WHERE id = ?`,
    [name, emergencyTypeId, id]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return new Emergency(
    id,
    name,
    emergencyTypeId === null ? null : new EmergencyType(emergencyTypeId)
  );
}

export async function deleteEmergency(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM \`${table}\` WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}