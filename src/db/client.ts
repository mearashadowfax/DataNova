import { createClient } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { mkdirSync } from 'node:fs';
import { getConfig, type DbConfig } from '@/config';

export type Database = LibSQLDatabase;

/** Build a Drizzle handle for a resolved database config. */
export function createDb(db: DbConfig): Database {
  if (db.kind === 'missing') {
    throw new Error(db.reason);
  }
  if (db.kind === 'local-file') {
    // libSQL creates the database file but not its directory, and .data/ is git-ignored.
    mkdirSync('.data', { recursive: true });
    return drizzle(createClient({ url: db.url }));
  }
  return drizzle(createClient({ url: db.url, authToken: db.authToken }));
}

let cached: Database | undefined;

/** The app's database, opened on first use so importing a route never touches the disk. */
export function getDb(): Database {
  cached ??= createDb(getConfig().db);
  return cached;
}
