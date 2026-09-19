/**
 * Environment configuration, resolved once.
 *
 * Every fallback pair, default and production rule lives here. Consumers read
 * `config.db`, `config.forms`, `config.keystatic` instead of the raw env, so a
 * renamed variable or a new rule is a one-file change with one set of tests.
 *
 * Keep this file free of Vite-only and Node-only imports: `drizzle.config.ts`
 * feeds it `process.env`, and Keystatic bundles it for the browser.
 */

export const ENV_KEYS = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'ASTRO_DB_REMOTE_URL',
  'ASTRO_DB_APP_TOKEN',
  'VERCEL',
  'FORMSPREE_CONTACT_ENDPOINT',
  'FORM_WEBHOOK_CONTACT',
  'FORMSPREE_NEWSLETTER_ENDPOINT',
  'FORM_WEBHOOK_NEWSLETTER',
  'KEYSTATIC_STORAGE_MODE',
  'KEYSTATIC_GITHUB_REPO_OWNER',
  'KEYSTATIC_GITHUB_REPO_NAME',
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];
export type EnvSource = Partial<Record<EnvKey, string | undefined>>;

export const LOCAL_DB_URL = 'file:.data/local.db';

export type DbConfig =
  | { kind: 'remote'; url: string; authToken: string | undefined }
  | { kind: 'local-file'; url: string }
  | { kind: 'missing'; reason: string };

/** Delivery target keys; each form declaration names the one it delivers to. */
export type DeliveryTarget = 'contact' | 'newsletter';

export interface AppConfig {
  isVercel: boolean;
  db: DbConfig;
  /** Webhook URL per delivery target, or `null` for demo mode. */
  forms: Record<DeliveryTarget, string | null>;
  keystatic:
    { kind: 'local' } | { kind: 'github'; repo: `${string}/${string}` };
}

/** Treat empty strings as unset so `FOO=` in an env file behaves like a missing key. */
function read(env: EnvSource, ...keys: EnvKey[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (value) return value;
  }
  return undefined;
}

export function resolveConfig(env: EnvSource): AppConfig {
  const isVercel = Boolean(env.VERCEL);

  const dbUrl = read(env, 'TURSO_DATABASE_URL', 'ASTRO_DB_REMOTE_URL');
  let db: DbConfig;
  if (dbUrl) {
    db = {
      kind: 'remote',
      url: dbUrl,
      authToken: read(env, 'TURSO_AUTH_TOKEN', 'ASTRO_DB_APP_TOKEN'),
    };
  } else if (isVercel) {
    // Fail closed on Vercel – never silently use a local file DB there.
    db = {
      kind: 'missing',
      reason:
        'Missing TURSO_DATABASE_URL (or ASTRO_DB_REMOTE_URL). Configure a Turso database for production.',
    };
  } else {
    db = { kind: 'local-file', url: LOCAL_DB_URL };
  }

  const owner = read(env, 'KEYSTATIC_GITHUB_REPO_OWNER') ?? '';
  const name = read(env, 'KEYSTATIC_GITHUB_REPO_NAME') ?? '';

  return {
    isVercel,
    db,
    forms: {
      contact:
        read(env, 'FORMSPREE_CONTACT_ENDPOINT', 'FORM_WEBHOOK_CONTACT') ?? null,
      newsletter:
        read(env, 'FORMSPREE_NEWSLETTER_ENDPOINT', 'FORM_WEBHOOK_NEWSLETTER') ??
        null,
    },
    keystatic:
      read(env, 'KEYSTATIC_STORAGE_MODE') === 'github'
        ? { kind: 'github', repo: `${owner}/${name}` }
        : { kind: 'local' },
  };
}

let cached: AppConfig | undefined;

/**
 * The app's resolved configuration, read on first use.
 *
 * Each key is read explicitly because Astro inlines private env at build time
 * by rewriting `import.meta.env.KEY`. Reading lazily keeps this module safe to
 * import from plain Node (drizzle-kit) and from tests, where no env is needed.
 */
export function getConfig(): AppConfig {
  cached ??= resolveConfig({
    TURSO_DATABASE_URL: import.meta.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: import.meta.env.TURSO_AUTH_TOKEN,
    ASTRO_DB_REMOTE_URL: import.meta.env.ASTRO_DB_REMOTE_URL,
    ASTRO_DB_APP_TOKEN: import.meta.env.ASTRO_DB_APP_TOKEN,
    VERCEL: import.meta.env.VERCEL,
    FORMSPREE_CONTACT_ENDPOINT: import.meta.env.FORMSPREE_CONTACT_ENDPOINT,
    FORM_WEBHOOK_CONTACT: import.meta.env.FORM_WEBHOOK_CONTACT,
    FORMSPREE_NEWSLETTER_ENDPOINT: import.meta.env
      .FORMSPREE_NEWSLETTER_ENDPOINT,
    FORM_WEBHOOK_NEWSLETTER: import.meta.env.FORM_WEBHOOK_NEWSLETTER,
    KEYSTATIC_STORAGE_MODE: import.meta.env.KEYSTATIC_STORAGE_MODE,
    KEYSTATIC_GITHUB_REPO_OWNER: import.meta.env.KEYSTATIC_GITHUB_REPO_OWNER,
    KEYSTATIC_GITHUB_REPO_NAME: import.meta.env.KEYSTATIC_GITHUB_REPO_NAME,
  });
  return cached;
}
