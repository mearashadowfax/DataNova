import { config, fields, collection } from '@keystatic/core';

// https://keystatic.com/docs/local-mode
// Set storage mode via environment variable: KEYSTATIC_STORAGE_MODE=github or leave unset for local
const KEYSTATIC_STORAGE_MODE =
  import.meta.env.KEYSTATIC_STORAGE_MODE ?? 'local';

// GitHub repository details — set these in your .env file for GitHub mode:
// KEYSTATIC_GITHUB_REPO_OWNER=your-org
// KEYSTATIC_GITHUB_REPO_NAME=your-repo
const GITHUB_REPO_OWNER = import.meta.env.KEYSTATIC_GITHUB_REPO_OWNER ?? '';
const GITHUB_REPO_NAME = import.meta.env.KEYSTATIC_GITHUB_REPO_NAME ?? '';

export default config({
  storage:
    KEYSTATIC_STORAGE_MODE === 'github'
      ? {
          kind: 'github' as const,
          repo: `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}` as `${string}/${string}`,
        }
      : {
          kind: 'local' as const,
        },

  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/articles',
              publicPath: '@images/articles/',
            },
          },
        }),
        date: fields.date({
          label: 'Publication date',
          description: 'The date of the publication',
        }),
      },
    }),
    reference: collection({
      label: 'Reference',
      slugField: 'title',
      path: 'src/content/reference/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/reference',
              publicPath: '@images/reference/',
            },
          },
        }),
        date: fields.date({
          label: 'Publication date',
          description: 'The date of the publication',
        }),
      },
    }),
    spreadsheets: collection({
      label: 'Sample Spreadsheets',
      slugField: 'title',
      path: 'src/data/spreadsheets/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Spreadsheet Name' } }),
        description: fields.text({ label: 'Description' }),
        url: fields.url({ label: 'Link' }),
      },
    }),
    whitepapers: collection({
      label: 'Whitepapers',
      slugField: 'title',
      path: 'src/data/whitepapers/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Whitepaper Name' } }),
        description: fields.text({ label: 'Description' }),
        readLink: fields.url({ label: 'Read Link' }),
        btnTitle: fields.text({ label: 'Button Title' }),
        btnLink: fields.url({ label: 'Button Link' }),
      },
    }),
  },
});
