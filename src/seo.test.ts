import { describe, expect, it } from 'vitest';
import { describePage, pageTitle } from './seo';
import { site } from './site';

const url = new URL('https://example.test/about');

describe('pageTitle', () => {
  it('suffixes the brand unless the title already names it', () => {
    expect(pageTitle('About')).toBe('About - DataNova');
    expect(pageTitle('Contact DataNova')).toBe('Contact DataNova');
  });

  it('falls back to brand and headline for the homepage', () => {
    expect(pageTitle()).toBe(`${site.brand} - ${site.headline}`);
  });
});

describe('describePage', () => {
  it('derives schema.org data from the title and description', () => {
    const page = describePage({
      title: 'About',
      description: 'Who we are.',
      url,
    });
    expect(page.title).toBe('About - DataNova');
    expect(page.schema).toMatchObject({
      '@type': 'WebPage',
      '@id': url.href,
      url: url.href,
      name: 'About',
      description: 'Who we are.',
      isPartOf: {
        '@type': 'WebSite',
        url: site.url.href,
        name: site.brand,
        description: site.tagline,
      },
    });
  });

  it('supports other page kinds and extra fields', () => {
    const page = describePage({
      title: 'Guide',
      kind: 'TechArticle',
      url,
      extra: { datePublished: '2025-01-02' },
    });
    expect(page.schema).toMatchObject({
      '@type': 'TechArticle',
      datePublished: '2025-01-02',
    });
  });

  it('uses the site summary when a page gives no description', () => {
    expect(describePage({ url }).description).toBe(site.summary);
  });
});
