import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: { PGLITE_DIR: 'memory' },
    testTimeout: 20_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // `server-only` throws outside the React Server bundle; tests run in plain Node
      'server-only': path.resolve(import.meta.dirname, './src/test/empty.ts'),
    },
  },
});
