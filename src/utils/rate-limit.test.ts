import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit';
import { escapeHtml, stripHtml } from './sanitize';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const key = `test-${Math.random()}`;
    const first = rateLimit(key, { limit: 2, windowMs: 60_000 });
    const second = rateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, { limit: 1, windowMs: 60_000 });
    const blocked = rateLimit(key, { limit: 1, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe('sanitize', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>"x"&\'')).toBe(
      '&lt;script&gt;&quot;x&quot;&amp;&#39;'
    );
  });

  it('strips HTML tags from CMS text', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe(
      'Hello world'
    );
  });
});
