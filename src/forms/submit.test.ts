import { describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from '@/utils/rate-limit';
import { defineForm, formSchema } from './definition';
import { contactForm, newsletterForm, quoteForm } from './definitions';
import { submitForm, type FormResponse } from './submit';

const form = defineForm({
  name: 'test',
  endpoint: '/api/test',
  deliverTo: 'contact',
  rateLimit: { limit: 2 },
  fields: [
    {
      name: 'email',
      label: 'Email',
      kind: 'email',
      maxLength: 254,
      required: true,
    },
    { name: 'note', label: 'Note', kind: 'text', maxLength: 10 },
  ],
  messages: { legend: 'Test', sent: 'Sent.' },
});

function post(body: unknown, ip = '203.0.113.1') {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function deps(demo = false) {
  const deliver = vi.fn(async () => ({ demo }));
  return { deliver, limiter: createRateLimiter() };
}

async function run(body: unknown, d = deps(), ip?: string) {
  const response = await submitForm(form, post(body, ip), d);
  return {
    status: response.status,
    body: (await response.json()) as FormResponse,
  };
}

describe('submitForm', () => {
  it('delivers a valid submission tagged with the form name', async () => {
    const d = deps();
    const { status, body } = await run({ email: 'a@b.co', note: ' hi ' }, d);
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true, demo: false, message: 'Sent.' });
    expect(d.deliver).toHaveBeenCalledWith({
      email: 'a@b.co',
      note: 'hi',
      form: 'test',
    });
  });

  it('reports demo mode in the message', async () => {
    const { body } = await run({ email: 'a@b.co' }, deps(true));
    expect(body).toMatchObject({ ok: true, demo: true });
    expect(body.ok && body.message).toContain('FORMSPREE_CONTACT_ENDPOINT');
  });

  it('rejects invalid fields with 400', async () => {
    const d = deps();
    expect((await run({ email: 'nope' }, d, '10.0.0.1')).status).toBe(400);
    expect(
      (await run({ email: 'a@b.co', note: 'far too long' }, d, '10.0.0.2'))
        .status
    ).toBe(400);
    expect((await run({}, d, '10.0.0.3')).status).toBe(400);
    expect(d.deliver).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400 instead of crashing', async () => {
    expect((await run('{not json')).status).toBe(400);
  });

  it('silently drops honeypot hits with a success response', async () => {
    const d = deps();
    const { status, body } = await run(
      { email: 'a@b.co', website: 'http://spam' },
      d
    );
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(d.deliver).not.toHaveBeenCalled();
  });

  it('returns 429 once the form policy is exceeded', async () => {
    const d = deps();
    await run({ email: 'a@b.co' }, d);
    await run({ email: 'a@b.co' }, d);
    const { status, body } = await run({ email: 'a@b.co' }, d);
    expect(status).toBe(429);
    expect(body).toMatchObject({ ok: false, retryAfterSec: 60 });
    expect(d.deliver).toHaveBeenCalledTimes(2);
  });

  it('answers 500 when delivery fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const d = deps();
    d.deliver.mockRejectedValueOnce(new Error('Webhook responded with 502'));
    const { status, body } = await run({ email: 'a@b.co' }, d);
    expect(status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'Internal server error' });
  });
});

describe('form declarations', () => {
  it.each([contactForm, quoteForm, newsletterForm])(
    '$name: every required field is enforced by the server schema',
    f => {
      const schema = formSchema(f);
      const complete = Object.fromEntries(
        f.fields.map(field => [
          field.name,
          field.kind === 'select'
            ? field.options[0]
            : field.kind === 'email'
              ? 'a@b.co'
              : 'x',
        ])
      );
      expect(schema.safeParse(complete).success).toBe(true);

      for (const field of f.fields.filter(field => field.required)) {
        const missing = { ...complete };
        delete missing[field.name];
        expect(schema.safeParse(missing).success, `${field.name} missing`).toBe(
          false
        );
      }
    }
  );
});
