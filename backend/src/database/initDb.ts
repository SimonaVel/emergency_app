import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE_PATH = path.join(__dirname, 'seed_emergency_types.sql');

/**
 * Creates the "emergency_db" MySQL database (if it doesn't already exist),
 * the table backing the Emergency entity, and seeds it with the default
 * emergency types from seed_emergency_types.sql.
 *
 * This connects without selecting a database first, since the target
 * database may not exist yet.
 */
export async function initDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: false,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.mysql.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    await connection.changeUser({ database: env.mysql.database });

    await connection.query(
      `CREATE TABLE IF NOT EXISTS \`${env.mysql.emergenciesTable}\` (
         id INT AUTO_INCREMENT PRIMARY KEY,
         name VARCHAR(255) NOT NULL
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    await seedEmergencyTypes(connection);
  } finally {
    await connection.end();
  }
}

/**
 * Loads the default emergency types from seed_emergency_types.sql into the
 * emergencies table. Runs on every initDatabase() call, but only actually
 * inserts while the table is still empty, so it never creates duplicates.
 */
async function seedEmergencyTypes(connection: Connection): Promise<void> {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM \`${env.mysql.emergenciesTable}\``
  );
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) {
    return;
  }

  const seedSql = await readFile(SEED_FILE_PATH, 'utf-8');
  await connection.query(seedSql);
}

// Allow running this file directly: `npm run db:init`
const isDirectRun = process.argv[1]?.endsWith('initDb.ts') || process.argv[1]?.endsWith('initDb.js');
if (isDirectRun) {
  initDatabase()
    .then(() => {
      console.log(`Database "${env.mysql.database}" and table "${env.mysql.emergenciesTable}" are ready.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}
