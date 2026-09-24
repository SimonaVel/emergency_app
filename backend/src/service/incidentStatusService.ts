import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../database/pool.js';
import { IncidentStatus } from '../models/IncidentStatus.js';

interface IncidentStatusRow extends RowDataPacket {
    id: number;
    name: string;
}

const table = 'incident_statuses';

function toIncidentStatus(row: IncidentStatusRow): IncidentStatus {
    return new IncidentStatus(row.id, row.name);
}

export async function createIncidentStatus(name: string): Promise<IncidentStatus> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`${table}\` (name) VALUES (?)`,
    [name]
  );
  return new IncidentStatus(
    result.insertId, name
  );
}

export async function getAllIncidentStatuses(): Promise<IncidentStatus[]> {
    const [rows] = await pool.execute<IncidentStatusRow[]>(
        `SELECT id, name FROM ${table} ORDER BY id`,
    );

    return rows.map(toIncidentStatus);
}

export async function getIncidentStatusById(
    id: number,
): Promise<IncidentStatus | null> {
    const [rows] = await pool.execute<IncidentStatusRow[]>(
        `SELECT id, name FROM ${table} WHERE id = ? LIMIT 1`,
        [id],
    );

    return rows.length > 0 ? toIncidentStatus(rows[0]) : null;
}

export async function getIncidentStatusByName(
    name: string,
): Promise<IncidentStatus | null> {
    const [rows] = await pool.execute<IncidentStatusRow[]>(
        `SELECT id, name FROM ${table} WHERE name = ? LIMIT 1`,
        [name],
    );

    return rows.length > 0 ? toIncidentStatus(rows[0]) : null;
}

export async function updateIncidentStatus(
    id: number,
    name: string,
): Promise<IncidentStatus | null> {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE ${table} SET name = ? WHERE id = ?`,
        [name, id],
    );

    return result.affectedRows > 0 ? getIncidentStatusById(id) : null;
}

export async function deleteIncidentStatus(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM ${table} WHERE id = ?`,
        [id],
    );

    return result.affectedRows > 0;
}