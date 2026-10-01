import 'server-only';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type DB = PostgresJsDatabase<typeof schema>;

const MIGRATIONS = path.join(process.cwd(), 'drizzle');

/**
 * - DATABASE_URL set → real Postgres (Neon, Supabase, Railway, self-hosted…).
 *   Migrations run separately (`npm run db:migrate`, CI workflow).
 * - Not set → embedded PGlite in `.data/pglite`, migrated and seeded on first
 *   use. Zero setup for local development. Never used in production.
 */
async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = (await import('postgres')).default;
    // prepare:false keeps it compatible with transaction poolers (Neon/Supabase pooled URLs)
    const client = postgres(url, { prepare: false, max: process.env.VERCEL ? 1 : 10 });
    return drizzle({ client, schema });
  }

  // An embedded database in production would silently lose data on every deploy.
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_EMBEDDED_DB) {
    throw new Error('DATABASE_URL is required in production (set ALLOW_EMBEDDED_DB=1 to try `next start` locally).');
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const dataDir = process.env.PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite');
  if (dataDir !== 'memory') mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir === 'memory' ? undefined : dataDir);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  const { seedIfEmpty } = await import('./seed');
  await seedIfEmpty(db as unknown as DB);
  return db as unknown as DB;
}

// Survive dev hot reloads (one embedded database per process).
const globalForDb = globalThis as unknown as { __buddiesDb?: Promise<DB> };

export function getDb(): Promise<DB> {
  globalForDb.__buddiesDb ??= connect().catch((error) => {
    globalForDb.__buddiesDb = undefined;
    throw error;
  });
  return globalForDb.__buddiesDb;
}

export { schema };
