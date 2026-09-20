import { describe, expect, it } from 'vitest';
import { pageExists } from '@/test/page-exists';
import { quoteForm } from './forms/declarations';
import { editionList, licenseOptions, product, releaseLabel } from './product';

describe('product catalog', () => {
  it('lists every edition with a download and a register link', () => {
    expect(editionList.map(e => e.id)).toEqual(['essential', 'advanced']);
    for (const edition of editionList) {
      expect(pageExists(edition.hrefs.download)).toBe(true);
      expect(pageExists(edition.hrefs.register)).toBe(true);
    }
  });

  it('only references known editions in the comparison matrix and releases', () => {
    const ids = new Set(editionList.map(e => e.id));
    for (const row of product.comparison) {
      expect(row.includedIn.length).toBeGreaterThan(0);
      for (const id of row.includedIn) expect(ids.has(id)).toBe(true);
    }
    for (const release of product.olderReleases)
      expect(ids.has(release.edition)).toBe(true);
    expect(ids.has(product.subscription.edition)).toBe(true);
  });

  it('labels releases by version and edition name', () => {
    expect(releaseLabel({ version: '5.x', edition: 'advanced' })).toBe(
      '5.x - Advanced Edition'
    );
  });

  it('is the source of the quote form license options', () => {
    const field = quoteForm.fields.find(f => f.name === 'licenseType');
    expect(field?.kind === 'select' && [...field.options]).toEqual([
      ...licenseOptions,
    ]);
    expect(licenseOptions).toContain(product.subscription.name);
  });

  it('links to existing pages', () => {
    expect(pageExists(product.compare.href)).toBe(true);
    expect(pageExists(product.links.install)).toBe(true);
  });
});
