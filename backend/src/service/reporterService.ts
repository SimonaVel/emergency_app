import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../database/pool.js";
import { Reporter } from "../models/Reporter.js";

interface ReporterRow extends RowDataPacket {
    id: number;
    name: string;
    phoneNumber: string;
    }

const table = "reporters";

function toReporter(row: ReporterRow): Reporter {
    return new Reporter(row.id, row.name, row.phoneNumber);
}

export async function createReporter(
    name: string,
    phoneNumber: string,
): Promise<Reporter> {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO \`${table}\` (name, phone_number) VALUES (?, ?)`,
        [name, phoneNumber],
    );
    return new Reporter(result.insertId, name, phoneNumber);
}

export async function getAllReporters(): Promise<Reporter[]> {
    const [rows] = await pool.query<ReporterRow[]>(
        `SELECT id, name, phone_number AS phoneNumber FROM \`${table}\` ORDER BY id DESC`,
    );
    return rows.map(toReporter);
}

export async function getReporterById(id: number): Promise<Reporter | null> {
    const [rows] = await pool.query<ReporterRow[]>(
        `SELECT id, name, phone_number AS phoneNumber FROM \`${table}\` WHERE id = ?`,
        [id]
    );
    return rows.length > 0 ? toReporter(rows[0]) : null;
}

export async function getReporterByName(name: string): Promise<Reporter | null> {
    const [rows] = await pool.query<ReporterRow[]>(
        `SELECT id, name, phone_number AS phoneNumber FROM \`${table}\` WHERE name = ?`,
        [name]
    );
    return rows.length > 0 ? toReporter(rows[0]) : null;
}

export async function updateReporter(
    id: number,
    name: string,
    phoneNumber: string,
): Promise<Reporter | null> {
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE \`${table}\` SET name = ?, phone_number = ? WHERE id = ?`,
        [name, phoneNumber, id],
    );
    if (result.affectedRows === 0) {
        return null;
    }
    return new Reporter(id, name, phoneNumber);
}

export async function deleteReporter(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM \`${table}\` WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}