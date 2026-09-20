import { describe, expect, it } from 'vitest';
import { stripHtml } from './sanitize';

describe('sanitize', () => {
  it('strips HTML tags from CMS text', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe(
      'Hello world'
    );
  });
});
