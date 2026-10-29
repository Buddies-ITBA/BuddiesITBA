// Plain-JS migration runner used by the Docker image at startup (no tsx needed).
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
const client = postgres(process.env.DATABASE_URL, { max: 1 });
await migrate(drizzle({ client }), { migrationsFolder: 'drizzle' });
await client.end();
console.log('✓ Database migrated');
