import { site } from '@/site';

/**
 * The product catalog: what DataNova Core is sold as. Every Downloads page is
 * a view of this object, and the quote form's license options come from it,
 * so a price, blurb or requirement changes in one place.
 */

export type EditionId = 'essential' | 'advanced';

export interface Edition {
  id: EditionId;
  name: string;
  /** Who it is for – one short line. */
  audience: string;
  blurb: string;
  price: { amount: string; per: string };
  hrefs: { download: string; register: string };
}

export interface ComparisonRow {
  feature: string;
  /** Optional "learn more" link. */
  href?: string;
  includedIn: readonly EditionId[];
}

const TRIAL_DAYS = 30;

const editions = {
  essential: {
    id: 'essential',
    name: 'Essential Edition',
    audience: 'For individuals and small teams.',
    blurb:
      'Unlock your data’s potential with robust analytics tools, including 30+ statistical models and 25+ visualization templates to turn insights into action.',
    price: { amount: '$115.15', per: '/Single-User License' },
    hrefs: { download: '#', register: '#' },
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Edition',
    audience: 'For data-driven organizations.',
    blurb:
      'Experience unparalleled AI-powered analytics with automated pattern recognition, anomaly detection, and advanced forecasting tools to stay ahead.',
    price: { amount: '$250.50', per: '/Single-User License' },
    hrefs: { download: '#', register: '#' },
  },
} as const satisfies Record<EditionId, Edition>;

export const product = {
  name: site.product,
  intro: `The ${site.product} comes in two editions: ${editions.essential.name} and ${editions.advanced.name}. Choose the one that fits your goals to unlock your data's full potential. Upgrading is simple when you're ready to grow.`,
  editions,
  trial: {
    days: TRIAL_DAYS,
    note: `Try both editions free for ${TRIAL_DAYS} days – no commitment or personal info required.`,
  },
  /** One statement of what the software runs on, shown wherever requirements appear. */
  systemRequirements: `Requires Windows 10/11 with Excel 2016, 2019, 2021, or Office 365 (32-bit, 64-bit, or Arm) or macOS 11 (Big Sur) or later.`,
  subscription: {
    name: 'Subscription License',
    edition: 'advanced' as EditionId,
    price: { amount: '$14.40', per: '/month' },
    href: '#',
    requirements:
      'An internet connection is required for activation and subscription verification.',
  },
  compare: {
    label: 'Compare editions & features',
    href: '/downloads/editions',
    ariaLabel: `Explore the detailed feature comparison of the ${editions.essential.name} and ${editions.advanced.name} of ${site.product}.`,
  },
  links: {
    eula: '#',
    install: '/downloads/editions',
  },
  comparison: [
    {
      feature: 'Interactive dashboards for visualization',
      href: '#',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Advanced AI-driven predictive modeling',
      href: '#',
      includedIn: ['advanced'],
    },
    {
      feature: 'Automatic data cleaning and preprocessing',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Integration with external data sources (APIs, databases)',
      includedIn: ['advanced'],
    },
    {
      feature: 'Customizable simulation parameters',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Real-time collaboration with team members',
      includedIn: ['advanced'],
    },
    {
      feature: 'Data import/export in multiple formats (CSV, JSON, etc.)',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Batch processing for large datasets',
      includedIn: ['advanced'],
    },
    {
      feature: 'Custom macro creation for repetitive tasks',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Scenario analysis and optimization tools',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Enhanced charting with extended templates',
      includedIn: ['essential', 'advanced'],
    },
    {
      feature: 'Exportable analysis reports with templates',
      includedIn: ['essential', 'advanced'],
    },
    { feature: 'Support for cloud-based backups', includedIn: ['advanced'] },
  ] as readonly ComparisonRow[],
  /** Older major versions still offered, newest first; 3.x is the last to support Excel 2003. */
  olderReleases: [
    { version: '5.x', edition: 'essential', href: '#' },
    { version: '5.x', edition: 'advanced', href: '#' },
    { version: '4.x', edition: 'essential', href: '#' },
    { version: '4.x', edition: 'advanced', href: '#' },
    { version: '3.x', edition: 'essential', href: '#' },
    { version: '3.x', edition: 'advanced', href: '#' },
  ] as readonly { version: string; edition: EditionId; href: string }[],
} as const;

/** Editions in display order. */
export const editionList: readonly Edition[] = Object.values(editions);

/** `"5.x - Essential Edition"` */
export function releaseLabel(release: {
  version: string;
  edition: EditionId;
}): string {
  return `${release.version} - ${editions[release.edition].name}`;
}

/** The choices a quote request can name. */
export const licenseOptions = [
  editions.essential.name,
  editions.advanced.name,
  product.subscription.name,
  'Other / Unsure',
] as const;
