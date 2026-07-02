import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

function getDatabaseUrl(): string {
  return (
    import.meta.env.TURSO_DATABASE_URL ??
    import.meta.env.ASTRO_DB_REMOTE_URL ??
    'file:.data/local.db'
  );
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
