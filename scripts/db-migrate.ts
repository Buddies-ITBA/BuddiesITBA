/**
 * Applies pending migrations to DATABASE_URL.
 * Usage: DATABASE_URL=... npm run db:migrate   (also run by .github/workflows/db-migrate.yml)
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

try {
  process.loadEnvFile('.env.local');
} catch {}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. (Local PGlite migrates itself on `npm run dev`.)');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
await migrate(drizzle({ client }), { migrationsFolder: 'drizzle' });
await client.end();
console.log('✓ Migrations applied');
