import { describe, expect, it } from 'vitest';
import { escapeHtml, stripHtml } from './sanitize';

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
