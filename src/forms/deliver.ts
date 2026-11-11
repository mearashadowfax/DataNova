import type { DeliveryConfig } from '@/config';

/**
 * The delivery seam. Two adapters satisfy it in production – a JSON webhook
 * (e.g. Formspree) and Demo Mode, which logs instead – and tests pass a fake.
 */
export type Deliver = (
  payload: Record<string, unknown>
) => Promise<DeliveryResult>;

export type DeliveryResult =
  | { demo: false }
  /** `hint` tells the site owner how to leave Demo Mode; it is shown to the submitter. */
  | { demo: true; hint: string };

/** The adapter for a delivery target: its webhook when configured, Demo Mode otherwise. */
export function delivererFor(
  { webhookUrl, envVar }: DeliveryConfig,
  fetchImpl: typeof fetch = fetch
): Deliver {
  if (!webhookUrl) {
    const hint = `Demo mode – set ${envVar} to deliver.`;
    return async payload => {
      console.info(`[forms] ${hint}`, payload);
      return { demo: true, hint };
    };
  }

  return async payload => {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }

    return { demo: false };
  };
}
