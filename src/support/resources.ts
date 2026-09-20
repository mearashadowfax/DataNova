/**
 * The support hub's resources, one entry per index page. Each doc collection,
 * the whitepapers list and the sample spreadsheets share this shape so the
 * page frame (hero, breadcrumbs, empty state) is rendered once.
 */

export interface SupportResource {
  label: string;
  basePath: string;
  empty: { title: string; description: string };
}

export const supportResources = {
  articles: {
    label: 'Articles',
    basePath: '/support/articles',
    empty: {
      title: 'No articles yet',
      description:
        'Add articles under src/content/articles to populate this list.',
    },
  },
  reference: {
    label: 'Reference',
    basePath: '/support/reference',
    empty: {
      title: 'No reference docs yet',
      description:
        'Add reference entries under src/content/reference to populate this list.',
    },
  },
  whitepapers: {
    label: 'Whitepapers',
    basePath: '/support/whitepapers',
    empty: {
      title: 'No whitepapers yet',
      description: 'Add whitepaper entries under src/data/whitepapers.',
    },
  },
  spreadsheets: {
    label: 'Sample Spreadsheets',
    basePath: '/support/sample-spreadsheets',
    empty: {
      title: 'No sample spreadsheets yet',
      description: 'Add spreadsheet entries under src/data/spreadsheets.',
    },
  },
} as const satisfies Record<string, SupportResource>;

export type SupportResourceId = keyof typeof supportResources;
