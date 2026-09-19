import { config, fields, collection } from '@keystatic/core';
import { getConfig } from './src/config';

// https://keystatic.com/docs/local-mode
// Storage mode comes from PUBLIC_KEYSTATIC_STORAGE_MODE (github | local) and the
// PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER / PUBLIC_KEYSTATIC_GITHUB_REPO_NAME pair – see src/config.ts.
const { keystatic } = getConfig();

/** A Markdoc document collection: articles and reference share one shape. */
function docCollection(label: string, dir: string) {
  return collection({
    label,
    slugField: 'title',
    path: `src/content/${dir}/*` as const,
    format: { contentField: 'content' },
    schema: {
      title: fields.slug({ name: { label: 'Title' } }),
      description: fields.text({ label: 'Description' }),
      content: fields.markdoc({
        label: 'Content',
        options: {
          image: {
            directory: `src/assets/images/${dir}`,
            publicPath: `@images/${dir}/`,
          },
        },
      }),
      date: fields.date({
        label: 'Publication date',
        description: 'The date of the publication',
      }),
    },
  });
}

export default config({
  storage:
    keystatic.kind === 'github'
      ? { kind: 'github', repo: keystatic.repo }
      : { kind: 'local' },

  collections: {
    articles: docCollection('Articles', 'articles'),
    reference: docCollection('Reference', 'reference'),
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
