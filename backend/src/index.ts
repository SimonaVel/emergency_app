import { initDatabase } from './database/initDb.js';
import { createServer } from './server.js';
import { env } from './config/env.js';

async function main() {
  await initDatabase();
  console.log(`Database "${env.mysql.database}" ready.`);

  const app = createServer();
  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
