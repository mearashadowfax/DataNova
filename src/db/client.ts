import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

function getDatabaseUrl(): string {
  const url =
    import.meta.env.TURSO_DATABASE_URL ?? import.meta.env.ASTRO_DB_REMOTE_URL;

  if (url) return url;

  // Fail closed on Vercel when Turso env is missing – never silently use a local file DB there.
  if (import.meta.env.VERCEL) {
    throw new Error(
      'Missing TURSO_DATABASE_URL (or ASTRO_DB_REMOTE_URL). Configure a Turso database for production.'
    );
  }

  return 'file:.data/local.db';
}

function getAuthToken(): string | undefined {
  const token =
    import.meta.env.TURSO_AUTH_TOKEN ?? import.meta.env.ASTRO_DB_APP_TOKEN;
  return token || undefined;
}

const client = createClient({
  url: getDatabaseUrl(),
  authToken: getAuthToken(),
});

export const db = drizzle(client);
