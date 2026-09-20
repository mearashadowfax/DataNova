/**
 * Everything that identifies this site: URL, brand, company details and the
 * external links the pages point at. `astro.config.mjs` reads `site.url`, so
 * config and content cannot disagree about where the site lives.
 *
 * Replace these with your own – the contact values are placeholders from
 * reserved ranges (example.com, the fictional 555-01xx phone block, "Anytown").
 */

const founded = 2018;

export const site = {
  /** Canonical origin; also the `site` in astro.config.mjs. */
  url: new URL('https://data-nova.vercel.app'),
  /** Short name used in titles, the logo and schema.org. */
  brand: 'DataNova',
  /** The product the downloads pages sell. */
  product: 'DataNova Core',
  /** Legal company name. */
  name: 'DataNova Analytics Inc.',
  founded,
  /** Title tail for the homepage and social cards. */
  headline: 'Unlock Insights from Your Excel Data',
  /** Default meta description when a page gives none. */
  summary:
    "Unlock powerful data insights with DataNova's advanced analytics suite for Excel. Visualize, analyze, and make data-driven decisions in minutes with seamless Excel integration, AI-powered analysis, and predictive forecasting models.",
  /** What the company does – schema.org WebSite description. */
  tagline:
    'DataNova Analytics Inc. provides advanced analytics for Excel to help businesses unlock actionable insights quickly with no coding required.',
  /** Who the company is – footer blurb. */
  description: `DataNova Analytics Inc. is a leading business intelligence and analytics software company founded in ${founded}, with offices across the United States.`,
  address: {
    street: '123 Example Street, Suite 100',
    city: 'Anytown, WA 00000',
    country: 'USA',
  },
  phone: '1 (555) 555-0123',
  email: 'hello@example.com',
  salesEmail: 'sales@example.com',
  /** External destinations; every host here must be allowed by the CSP in vercel.json. */
  links: {
    trial: 'https://github.com/mearashadowfax/DataNova',
    repo: 'https://github.com/mearashadowfax/DataNova',
    video:
      'https://vyclk3sx0z.ufs.sh/f/hv6ttNERWpXuOGj0KhIPk5MLw0bimBlYnq6Vd2NfSJW9gCQU',
  },
} as const;

/** `tel:` href for a display phone number. */
export function telHref(phone: string): string {
  return `tel:+${phone.replace(/[^\d]/g, '')}`;
}
