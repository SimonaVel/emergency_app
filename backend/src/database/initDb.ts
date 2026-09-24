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
    const [databases] = await connection.query<RowDataPacket[]>(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [env.mysql.database]
    );
    const databaseExisted = databases.length > 0;

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.mysql.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    await connection.changeUser({ database: env.mysql.database });

    await createSchema(connection);
  await seedEmergencyDB(connection, databaseExisted);
  } finally {
    await connection.end();
  }
}

/**
 * Creates all application tables from schema.sql. The connection is set up
 * with multipleStatements disabled, so the file is split into individual
 * `CREATE TABLE` statements and run one at a time, in the order they appear
 * (which also gives the correct order for their foreign key dependencies).
 */
async function createSchema(connection: Connection): Promise<void> {
  await runSqlFile(connection, SCHEMA_FILE_PATH);
}

/**
 * Reads a .sql file and runs its statements one at a time, since the
 * connection is set up with multipleStatements disabled.
 */
async function runSqlFile(connection: Connection, filePath: string): Promise<void> {
  const sql = await readFile(filePath, 'utf-8');
  const withoutComments = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = withoutComments
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

/**
 * Loads the default emergency data needed in the database. Runs on every initDatabase() call, but only actually
 * inserts while the table is still empty, so it never creates duplicates.
 */
async function seedEmergencyDB(connection: Connection, databaseExisted: boolean): Promise<void> {
  if (!databaseExisted) {
    await runSqlFile(connection, SEED_FILE_PATH);
    return;
  }

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
      console.log(`Database "${env.mysql.database}" and tables "emergency_types", "emergencies" and "incident_statuses" are ready.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}
