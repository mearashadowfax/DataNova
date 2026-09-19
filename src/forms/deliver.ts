/**
 * The delivery seam. Two adapters satisfy it in production – a JSON webhook
 * (e.g. Formspree) and demo mode, which logs instead – and tests pass a fake.
 */
export type Deliver = (
  payload: Record<string, unknown>
) => Promise<{ demo: boolean }>;

export function delivererFor(
  webhookUrl: string | null,
  fetchImpl: typeof fetch = fetch
): Deliver {
  if (!webhookUrl) {
    return async payload => {
      console.info(
        '[forms] Demo mode – set FORMSPREE_* or FORM_WEBHOOK_* to deliver submissions.',
        payload
      );
      return { demo: true };
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
