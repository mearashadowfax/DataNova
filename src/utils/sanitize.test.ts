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

  it('removes nested and unclosed tags completely', () => {
    expect(stripHtml('<scr<>ipt>alert(123)</script>')).toBe('iptalert(123)');
    expect(stripHtml('<img src=x onerror=alert(1)')).toBe(
      'img src=x onerror=alert(1)'
    );
  });

  it('decodes entities without double-unescaping', () => {
    expect(stripHtml('A &amp;lt; B &amp;amp; C')).toBe('A &lt; B &amp; C');
    expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
    expect(stripHtml('1 &lt; 2')).toBe('1 < 2');
  });
});
