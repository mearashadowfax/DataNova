import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deliveryOrigins } from './forms/delivery';
import { site } from './site';

/**
 * vercel.json's Content-Security-Policy is a hand-written allowlist. This test
 * ties it to the origins the code actually loads from, so a changed video host
 * or delivery service fails here instead of silently in production.
 */
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const csp = vercel.headers
  .flatMap(h => h.headers)
  .find(h => h.key === 'Content-Security-Policy')!.value;

function directive(name: string): string[] {
  const match = csp
    .split(';')
    .map(s => s.trim())
    .find(s => s.startsWith(`${name} `));
  return match ? match.split(/\s+/).slice(1) : [];
}

describe('Content-Security-Policy', () => {
  it('allows the hero video host in media-src', () => {
    expect(directive('media-src')).toContain(new URL(site.links.video).origin);
  });

  it.each(deliveryOrigins)('allows form delivery to %s', origin => {
    expect(directive('connect-src')).toContain(origin);
    expect(directive('form-action')).toContain(origin);
  });
});
