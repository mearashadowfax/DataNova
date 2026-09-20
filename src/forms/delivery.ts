/**
 * Where submissions go. Each delivery target resolves to a Formspree (or
 * any JSON-accepting) URL from a `PUBLIC_` variable, or `null` for demo mode –
 * the form then pretends to send so the template works before any account
 * exists. The variable names are spelled once, in `deliveryEnvVar`.
 */

export type DeliveryTarget = 'contact' | 'newsletter';

/** The variable to set to take a delivery target out of demo mode. */
export const deliveryEnvVar = {
  contact: 'PUBLIC_FORMSPREE_CONTACT',
  newsletter: 'PUBLIC_FORMSPREE_NEWSLETTER',
} as const satisfies Record<DeliveryTarget, string>;

export type DeliveryEnvKey = (typeof deliveryEnvVar)[DeliveryTarget];
export type DeliveryEnv = Partial<Record<DeliveryEnvKey, string | undefined>>;

/** Origins a browser must be allowed to post to; `vercel.json`'s CSP lists them. */
export const deliveryOrigins = ['https://formspree.io'] as const;

/** Resolve every target's URL; blank values count as unset. */
export function resolveDeliveryTargets(
  env: DeliveryEnv
): Record<DeliveryTarget, string | null> {
  const targets = {} as Record<DeliveryTarget, string | null>;
  for (const [target, key] of Object.entries(deliveryEnvVar) as [
    DeliveryTarget,
    DeliveryEnvKey,
  ][]) {
    targets[target] = env[key]?.trim() || null;
  }
  return targets;
}

/** The URL for `target` at build time, from `.env`. */
export function deliveryTargetUrl(target: DeliveryTarget): string | null {
  return resolveDeliveryTargets(import.meta.env)[target];
}
