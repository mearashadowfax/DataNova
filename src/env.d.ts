/// <reference path="../.astro/types.d.ts" />

/** The only variables the site reads are the delivery endpoints declared in `src/forms/delivery.ts`. */
interface ImportMetaEnv extends Partial<
  Record<import('./forms/delivery').DeliveryEnvKey, string>
> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
