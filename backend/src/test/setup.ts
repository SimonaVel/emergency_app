import 'dotenv/config';

// Run tests against a dedicated database so they never touch dev data.
process.env.MYSQL_DATABASE = process.env.MYSQL_TEST_DATABASE ?? `${process.env.MYSQL_DATABASE ?? 'emergency_db'}_test`;

const { initDatabase } = await import('../database/initDb.js');
await initDatabase();
