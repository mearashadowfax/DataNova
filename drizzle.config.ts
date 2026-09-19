import { defineConfig } from 'drizzle-kit';
import { resolveConfig } from './src/config';
import { dbCredentials } from './src/db/credentials';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: dbCredentials(resolveConfig(process.env).db),
});
