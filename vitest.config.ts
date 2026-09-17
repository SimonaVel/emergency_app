import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['backend/**/*.test.ts'],
    setupFiles: ['./backend/src/test/setup.ts'],
    // Tests share one MySQL database and truncate tables between cases,
    // so files must run sequentially rather than in parallel workers.
    fileParallelism: false,
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
