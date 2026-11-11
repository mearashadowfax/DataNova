/// <reference path="../.astro/types.d.ts" />

/** Every private variable the app reads is declared once, in `src/config.ts`. */
interface ImportMetaEnv extends Partial<
  Record<import('./config').EnvKey, string>
> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Preline's `-non-auto` plugin builds export the class but ship no .d.ts;
// reuse the types of the auto builds (which ship types but no ES export).
declare module 'preline/plugins/dropdown-non-auto' {
  export { default } from 'preline/plugins/dropdown';
}
declare module 'preline/plugins/collapse-non-auto' {
  export { default } from 'preline/plugins/collapse';
}
