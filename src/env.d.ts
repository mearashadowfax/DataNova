/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_FORMSPREE_CONTACT?: string;
  readonly PUBLIC_FORMSPREE_NEWSLETTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
