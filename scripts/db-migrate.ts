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

// On Vercel this runs as part of `vercel-build`: only production deploys
// migrate, so a preview of an unmerged branch never changes the real schema.
if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
  console.log('Skipping migrations on a non-production Vercel deploy.');
  process.exit(0);
}
if (!url) {
  if (process.env.VERCEL) {
    console.error('DATABASE_URL is required in production.');
    process.exit(1);
  }
  console.error('DATABASE_URL is not set. (Local PGlite migrates itself on `npm run dev`.)');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
await migrate(drizzle({ client }), { migrationsFolder: 'drizzle' });
await client.end();
console.log('✓ Migrations applied');
