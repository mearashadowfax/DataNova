import { defineConfig } from 'drizzle-kit';

const url =
  process.env.TURSO_DATABASE_URL ??
  process.env.ASTRO_DB_REMOTE_URL ??
  'file:.data/local.db';

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
