import { describe, expect, it } from 'vitest';
import { LOCAL_DB_URL, resolveConfig } from './config';

describe('resolveConfig', () => {
  describe('database', () => {
    it('prefers TURSO_* over the legacy ASTRO_DB_* names', () => {
      const { db } = resolveConfig({
        TURSO_DATABASE_URL: 'libsql://turso',
        ASTRO_DB_REMOTE_URL: 'libsql://legacy',
        TURSO_AUTH_TOKEN: 'turso-token',
        ASTRO_DB_APP_TOKEN: 'legacy-token',
      });
      expect(db).toEqual({
        kind: 'remote',
        url: 'libsql://turso',
        authToken: 'turso-token',
      });
    });

    it('accepts the legacy names as fallbacks', () => {
      const { db } = resolveConfig({
        ASTRO_DB_REMOTE_URL: 'libsql://legacy',
        ASTRO_DB_APP_TOKEN: 'legacy-token',
      });
      expect(db).toEqual({
        kind: 'remote',
        url: 'libsql://legacy',
        authToken: 'legacy-token',
      });
    });

    it('treats an empty auth token as unset', () => {
      const { db } = resolveConfig({
        TURSO_DATABASE_URL: 'libsql://turso',
        TURSO_AUTH_TOKEN: '',
      });
      expect(db).toMatchObject({ kind: 'remote', authToken: undefined });
    });

    it('falls back to a local file outside Vercel', () => {
      expect(resolveConfig({}).db).toEqual({
        kind: 'local-file',
        url: LOCAL_DB_URL,
      });
    });

    it('fails closed on Vercel when no database URL is set', () => {
      const { db } = resolveConfig({ VERCEL: '1' });
      expect(db.kind).toBe('missing');
    });
  });

  describe('forms', () => {
    it('runs in demo mode when no webhook is configured', () => {
      expect(resolveConfig({}).forms).toEqual({
        contact: null,
        newsletter: null,
      });
    });

    it('prefers FORMSPREE_* over FORM_WEBHOOK_* per target', () => {
      const { forms } = resolveConfig({
        FORMSPREE_CONTACT_ENDPOINT: 'https://formspree.io/f/contact',
        FORM_WEBHOOK_CONTACT: 'https://example.com/contact',
        FORM_WEBHOOK_NEWSLETTER: 'https://example.com/newsletter',
      });
      expect(forms).toEqual({
        contact: 'https://formspree.io/f/contact',
        newsletter: 'https://example.com/newsletter',
      });
    });
  });

  describe('keystatic', () => {
    it('defaults to local storage', () => {
      expect(resolveConfig({}).keystatic).toEqual({ kind: 'local' });
    });

    it('builds the GitHub repo slug in github mode', () => {
      expect(
        resolveConfig({
          KEYSTATIC_STORAGE_MODE: 'github',
          KEYSTATIC_GITHUB_REPO_OWNER: 'acme',
          KEYSTATIC_GITHUB_REPO_NAME: 'site',
        }).keystatic
      ).toEqual({ kind: 'github', repo: 'acme/site' });
    });
  });
});
