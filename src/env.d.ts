/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TURSO_DATABASE_URL?: string;
  readonly TURSO_AUTH_TOKEN?: string;
  readonly ASTRO_DB_REMOTE_URL?: string;
  readonly ASTRO_DB_APP_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
