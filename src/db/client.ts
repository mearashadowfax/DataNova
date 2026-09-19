import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { getConfig, type DbConfig } from '@/config';
import { dbCredentials } from './credentials';

export type Database = LibSQLDatabase;

/** Build a Drizzle handle for a resolved database config. */
export function createDb(db: DbConfig): Database {
  return drizzle(createClient(dbCredentials(db)));
}

let cached: Database | undefined;

/** The app's database, opened on first use so importing a route never touches the disk. */
export function getDb(): Database {
  cached ??= createDb(getConfig().db);
  return cached;
}

/** Resolves when the database answers a trivial query; rejects when it is unreachable. */
export async function pingDb(db: Database = getDb()): Promise<void> {
  await db.run(sql`select 1`);
}
