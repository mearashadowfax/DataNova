/// <reference path="../.astro/types.d.ts" />

/** Every private variable the app reads is declared once, in `src/config.ts`. */
interface ImportMetaEnv extends Partial<
  Record<import('./config').EnvKey, string>
> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
