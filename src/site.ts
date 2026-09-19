/**
 * Company details shown in the footer, contact page and licensing copy.
 * Replace these with your own – the values below are placeholders from
 * reserved ranges (example.com, the fictional 555-01xx phone block).
 */
export const site = {
  name: 'DataNova Analytics Inc.',
  description:
    'DataNova Analytics Inc. is a leading business intelligence and analytics software company founded in 2018, with offices in Boston and Seattle.',
  address: {
    street: '123 Example Street, Suite 100',
    city: 'Seattle, WA 98104',
    country: 'USA',
  },
  phone: '1 (555) 555-0123',
  email: 'hello@example.com',
  salesEmail: 'sales@example.com',
  website: 'www.example.com',
} as const;

/** `tel:` href for a display phone number. */
export function telHref(phone: string): string {
  return `tel:+${phone.replace(/[^\d]/g, '')}`;
}
