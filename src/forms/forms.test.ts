import { describe, expect, it } from 'vitest';
import { HONEYPOT_FIELD, isTextInput } from './declare';
import { contactForm, newsletterForm, quoteForm } from './declarations';
import { resolveDeliveryTargets } from './delivery';

const forms = [contactForm, quoteForm, newsletterForm];

describe('form declarations', () => {
  it.each(forms)(
    '$name: field names are unique and never the honeypot',
    form => {
      const names = form.fields.map(field => field.name);
      expect(new Set(names).size).toBe(names.length);
      expect(names).not.toContain(HONEYPOT_FIELD);
    }
  );

  it('the newsletter form can render inline (has a single-line input)', () => {
    expect(newsletterForm.fields.some(isTextInput)).toBe(true);
  });

  it('every select has at least one option', () => {
    for (const field of forms.flatMap(form => form.fields)) {
      if (field.kind === 'select')
        expect(field.options.length).toBeGreaterThan(0);
    }
  });
});

describe('resolveDeliveryTargets', () => {
  it('runs in demo mode when nothing is configured', () => {
    expect(resolveDeliveryTargets({})).toEqual({
      contact: null,
      newsletter: null,
    });
  });

  it('treats blank values as unset and trims real ones', () => {
    expect(
      resolveDeliveryTargets({
        PUBLIC_FORMSPREE_CONTACT: '  https://formspree.io/f/abc  ',
        PUBLIC_FORMSPREE_NEWSLETTER: '   ',
      })
    ).toEqual({ contact: 'https://formspree.io/f/abc', newsletter: null });
  });
});
