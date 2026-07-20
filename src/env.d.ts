/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TURSO_DATABASE_URL?: string;
  readonly TURSO_AUTH_TOKEN?: string;
  readonly ASTRO_DB_REMOTE_URL?: string;
  readonly ASTRO_DB_APP_TOKEN?: string;
  readonly SKIP_KEYSTATIC?: string;
  readonly KEYSTATIC_STORAGE_MODE?: string;
  readonly KEYSTATIC_GITHUB_REPO_OWNER?: string;
  readonly KEYSTATIC_GITHUB_REPO_NAME?: string;
  readonly FORMSPREE_CONTACT_ENDPOINT?: string;
  readonly FORMSPREE_NEWSLETTER_ENDPOINT?: string;
  readonly FORM_WEBHOOK_CONTACT?: string;
  readonly FORM_WEBHOOK_NEWSLETTER?: string;
  readonly VERCEL?: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
