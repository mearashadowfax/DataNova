/**
 * Company details shown in the footer, contact page, licensing copy and
 * schema.org metadata. Replace these with your own – the values below are
 * placeholders from reserved ranges (example.com, the fictional 555-01xx
 * phone block, "Anytown").
 */
export const site = {
  name: 'DataNova Analytics Inc.',
  /** Who the company is – footer blurb. */
  description:
    'DataNova Analytics Inc. is a leading business intelligence and analytics software company founded in 2018, with offices across the United States.',
  /** What the company does – schema.org WebSite description. */
  tagline:
    'DataNova Analytics Inc. provides advanced analytics for Excel to help businesses unlock actionable insights quickly with no coding required.',
  address: {
    street: '123 Example Street, Suite 100',
    city: 'Anytown, WA 00000',
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
