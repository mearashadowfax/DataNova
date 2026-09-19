import { describe, expect, it } from 'vitest';
import { createDb, pingDb } from './client';

describe('database client', () => {
  it('pings an in-memory database', async () => {
    const db = createDb({
      kind: 'remote',
      url: ':memory:',
      authToken: undefined,
    });
    await expect(pingDb(db)).resolves.toBeUndefined();
  });

  it('refuses to open when the config says the database is missing', () => {
    expect(() => createDb({ kind: 'missing', reason: 'no db' })).toThrow(
      'no db'
    );
  });
});
