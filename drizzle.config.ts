import { defineConfig } from 'drizzle-kit';
import { mkdirSync } from 'node:fs';

const LOCAL_DB_URL = 'file:.data/local.db';

const url =
  process.env.TURSO_DATABASE_URL ??
  process.env.ASTRO_DB_REMOTE_URL ??
  LOCAL_DB_URL;

// libSQL creates the database file but not its directory, and .data/ is git-ignored.
if (url === LOCAL_DB_URL) {
  mkdirSync('.data', { recursive: true });
}

const authToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.ASTRO_DB_APP_TOKEN;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken,
  },
});
