import { describe, expect, it, vi } from 'vitest';
import { delivererFor } from './deliver';

describe('delivererFor', () => {
  it('posts the payload as JSON to the webhook', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const deliver = delivererFor(
      { webhookUrl: 'https://hook.test/x', envVar: 'FORM_WEBHOOK_CONTACT' },
      fetchImpl
    );

    expect(await deliver({ email: 'a@b.co' })).toEqual({ demo: false });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://hook.test/x',
      expect.objectContaining({ method: 'POST', body: '{"email":"a@b.co"}' })
    );
  });

  it('throws when the webhook refuses, so the endpoint answers 500', async () => {
    const deliver = delivererFor(
      { webhookUrl: 'https://hook.test/x', envVar: 'FORM_WEBHOOK_CONTACT' },
      async () => new Response(null, { status: 502 })
    );
    await expect(deliver({})).rejects.toThrow('502');
  });

  it('runs in Demo Mode without a webhook and names the variable to set', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const fetchImpl = vi.fn();
    const deliver = delivererFor(
      { webhookUrl: null, envVar: 'FORMSPREE_NEWSLETTER_ENDPOINT' },
      fetchImpl
    );

    expect(await deliver({})).toEqual({
      demo: true,
      hint: 'Demo mode – set FORMSPREE_NEWSLETTER_ENDPOINT to deliver.',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
