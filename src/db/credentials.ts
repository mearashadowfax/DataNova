import { mkdirSync } from 'node:fs';
import type { DbConfig } from '../config';

/**
 * Turn a resolved database config into libSQL connection credentials.
 * Shared by the app's client and by drizzle-kit, so the "create `.data/`
 * for a local file" rule and the "refuse to run without a database" rule
 * exist once. Imports are relative because drizzle-kit does not resolve
 * the `@/` alias.
 */
export function dbCredentials(db: DbConfig): {
  url: string;
  authToken?: string;
} {
  switch (db.kind) {
    case 'missing':
      throw new Error(db.reason);
    case 'local-file':
      // libSQL creates the database file but not its directory, and .data/ is git-ignored.
      mkdirSync('.data', { recursive: true });
      return { url: db.url };
    case 'remote':
      return { url: db.url, authToken: db.authToken };
  }
}
