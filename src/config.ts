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

/**
 * Each delivery target and the variables that hold its webhook URL, preferred
 * first. The first is the one Demo Mode tells you to set. A new target is one
 * line here; the compiler then points at `resolveConfig` and `getConfig`.
 */
export const deliveryTargets = {
  contact: ['FORMSPREE_CONTACT_ENDPOINT', 'FORM_WEBHOOK_CONTACT'],
  newsletter: ['FORMSPREE_NEWSLETTER_ENDPOINT', 'FORM_WEBHOOK_NEWSLETTER'],
} as const;

/** Delivery target keys; each form declaration names the one it delivers to. */
export type DeliveryTarget = keyof typeof deliveryTargets;

/** Every environment variable the app reads; `env.d.ts` types `import.meta.env` from this. */
export type EnvKey =
  | 'TURSO_DATABASE_URL'
  | 'TURSO_AUTH_TOKEN'
  | 'ASTRO_DB_REMOTE_URL'
  | 'ASTRO_DB_APP_TOKEN'
  | 'VERCEL'
  | (typeof deliveryTargets)[DeliveryTarget][number]
  // PUBLIC_ so the values reach the browser: Keystatic's admin UI is bundled
  // client-side and branches on the storage kind there too. None are secrets.
  | 'PUBLIC_KEYSTATIC_STORAGE_MODE'
  | 'PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER'
  | 'PUBLIC_KEYSTATIC_GITHUB_REPO_NAME';

export type EnvSource = Partial<Record<EnvKey, string | undefined>>;

export const LOCAL_DB_URL = 'file:.data/local.db';

export type DbConfig =
  | { kind: 'remote'; url: string; authToken: string | undefined }
  | { kind: 'local-file'; url: string }
  | { kind: 'missing'; reason: string };

/** Where a delivery target's submissions go, resolved from the environment. */
export interface DeliveryConfig {
  /** The webhook URL, or `null` for Demo Mode. */
  webhookUrl: string | null;
  /** The variable to set to take the target out of Demo Mode. */
  envVar: EnvKey;
}

export interface AppConfig {
  db: DbConfig;
  forms: Record<DeliveryTarget, DeliveryConfig>;
  keystatic:
    { kind: 'local' } | { kind: 'github'; repo: `${string}/${string}` };
}

/** The first key with a non-empty value, so `FOO=` in an env file behaves like a missing key. */
function firstSet(env: EnvSource, ...keys: EnvKey[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (value) return value;
  }
  return undefined;
}

/**
 * Turn raw environment variables into the app's typed configuration.
 * Pure: no I/O, no throwing – a missing production database is reported as
 * `db.kind === 'missing'` and fails where the database is first needed.
 */
export function resolveConfig(env: EnvSource): AppConfig {
  const isVercel = Boolean(env.VERCEL);

  const dbUrl = firstSet(env, 'TURSO_DATABASE_URL', 'ASTRO_DB_REMOTE_URL');
  let db: DbConfig;
  if (dbUrl) {
    db = {
      kind: 'remote',
      url: dbUrl,
      authToken: firstSet(env, 'TURSO_AUTH_TOKEN', 'ASTRO_DB_APP_TOKEN'),
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

  const delivery = (target: DeliveryTarget): DeliveryConfig => {
    const keys = deliveryTargets[target];
    return { webhookUrl: firstSet(env, ...keys) ?? null, envVar: keys[0] };
  };

  const owner = firstSet(env, 'PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER') ?? '';
  const name = firstSet(env, 'PUBLIC_KEYSTATIC_GITHUB_REPO_NAME') ?? '';

  return {
    db,
    forms: {
      contact: delivery('contact'),
      newsletter: delivery('newsletter'),
    },
    keystatic:
      firstSet(env, 'PUBLIC_KEYSTATIC_STORAGE_MODE') === 'github'
        ? { kind: 'github', repo: `${owner}/${name}` }
        : { kind: 'local' },
  };
}

let cached: AppConfig | undefined;

/**
 * The app's resolved configuration, read on first use.
 *
 * Each key is read explicitly because Astro inlines private env at build time
 * by rewriting `import.meta.env.KEY`; `satisfies` makes a key missing from
 * this list a compile error. Reading lazily keeps this module safe to
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
    PUBLIC_KEYSTATIC_STORAGE_MODE: import.meta.env
      .PUBLIC_KEYSTATIC_STORAGE_MODE,
    PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: import.meta.env
      .PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
    PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: import.meta.env
      .PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
  } satisfies Record<EnvKey, string | undefined>);
  return cached;
}
