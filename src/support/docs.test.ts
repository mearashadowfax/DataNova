import { describe, expect, it } from 'vitest';
import { describeDoc } from './docs';

const input = {
  collection: 'reference' as const,
  id: 'quick-start',
  data: {
    title: 'Quick start',
    description: 'Get going.',
    date: new Date('2025-03-04T00:00:00Z'),
  },
  body: '# Quick start\n\nSome words here.',
  headings: [
    { depth: 1, slug: 'quick-start', text: 'Quick start' },
    { depth: 2, slug: 'install', text: 'Install' },
    { depth: 3, slug: 'windows', text: 'Windows' },
    { depth: 2, slug: 'run', text: 'Run' },
  ],
  url: new URL('https://example.com/support/reference/quick-start'),
};

describe('describeDoc', () => {
  it('lists only second-level headings in the table of contents', () => {
    expect(describeDoc(input).toc).toEqual([
      { slug: 'install', text: 'Install' },
      { slug: 'run', text: 'Run' },
    ]);
  });

  it('derives SEO and schema.org data for every collection', () => {
    const doc = describeDoc(input);
    expect(doc.page.title).toBe('Quick start - DataNova');
    expect(doc.page.description).toBe('Get going.');
    expect(doc.page.schema).toMatchObject({
      '@type': 'TechArticle',
      name: 'Quick start',
      datePublished: '2025-03-04',
      url: 'https://example.com/support/reference/quick-start',
    });
    expect(
      describeDoc({ ...input, collection: 'articles' }).page.schema
    ).toMatchObject({
      '@type': 'Article',
    });
  });

  it('roots breadcrumbs at the collection index', () => {
    expect(describeDoc(input).breadcrumbs).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Support', href: '/support/articles' },
      { label: 'Reference', href: '/support/reference' },
      { label: 'Quick start' },
    ]);
  });

  it('has no reading time for an empty body', () => {
    expect(
      describeDoc({ ...input, body: undefined }).readingTime
    ).toBeUndefined();
    expect(describeDoc(input).readingTime).toMatch(/min read$/);
  });
});
