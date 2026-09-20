import { describe, expect, it } from 'vitest';
import { site, telHref } from './site';

describe('site', () => {
  it('has a canonical URL with no path', () => {
    expect(site.url.pathname).toBe('/');
    expect(site.url.protocol).toBe('https:');
  });

  it('turns a display phone number into a tel: href', () => {
    expect(telHref('1 (555) 555-0123')).toBe('tel:+15555550123');
  });
});
