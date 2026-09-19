import { defineConfig } from 'drizzle-kit';
import { mkdirSync } from 'node:fs';
import { resolveConfig } from './src/config';

const { db } = resolveConfig(process.env);

if (db.kind === 'missing') {
  throw new Error(db.reason);
}

// libSQL creates the database file but not its directory, and .data/ is git-ignored.
if (db.kind === 'local-file') {
  mkdirSync('.data', { recursive: true });
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: db.url,
    authToken: db.kind === 'remote' ? db.authToken : undefined,
  },
});
