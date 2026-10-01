/**
 * Creates (or resets the password of) an admin user.
 * Usage: DATABASE_URL=... npm run admin:create -- email@itba.edu.ar "Nombre" 'contraseña-larga'
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { admins } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth/password';

try {
  process.loadEnvFile('.env.local');
} catch {}

const [email, name, password] = process.argv.slice(2);
if (!process.env.DATABASE_URL || !email || !name || !password) {
  console.error('Usage: DATABASE_URL=... npm run admin:create -- <email> <name> <password>');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle({ client });
const passwordHash = await hashPassword(password);
await db
  .insert(admins)
  .values({ email: email.toLowerCase(), name, passwordHash })
  .onConflictDoUpdate({ target: admins.email, set: { name, passwordHash } });
await client.end();
console.log(`✓ Admin ${email} ready`);
