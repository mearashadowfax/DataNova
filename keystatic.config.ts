import { config, fields, collection } from '@keystatic/core';
import { getConfig } from './src/config';
import {
  docCollectionNames,
  docCollections,
  docFrontmatter,
  type DocCollection,
} from './src/support/collections';

// https://keystatic.com/docs/local-mode
// Storage mode comes from PUBLIC_KEYSTATIC_STORAGE_MODE (github | local) and the
// PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER / PUBLIC_KEYSTATIC_GITHUB_REPO_NAME pair – see src/config.ts.
const { keystatic } = getConfig();

/**
 * The frontmatter fields as Keystatic edits them. Labels come from the shared
 * declaration; `satisfies` makes a field added there a compile error here
 * until Keystatic can edit it too.
 */
const frontmatterFields = {
  title: fields.slug({ name: { label: docFrontmatter.title.label } }),
  description: fields.text({
    label: docFrontmatter.description.label,
    validation: { isRequired: true },
  }),
  date: fields.date({
    label: docFrontmatter.date.label,
    description: docFrontmatter.date.description,
    validation: { isRequired: true },
  }),
} satisfies Record<keyof typeof docFrontmatter, unknown>;

/** A Markdoc document collection: every doc collection shares one shape. */
function docCollection(name: DocCollection) {
  const { label, dir } = docCollections[name];
  return collection({
    label,
    slugField: 'title',
    path: `src/content/${dir}/*` as const,
    format: { contentField: 'content' },
    schema: {
      ...frontmatterFields,
      content: fields.markdoc({
        label: 'Content',
        options: {
          image: {
            directory: `src/assets/images/${dir}`,
            publicPath: `@images/${dir}/`,
          },
        },
      }),
    },
  });
}

const docs = Object.fromEntries(
  docCollectionNames.map(name => [name, docCollection(name)])
) as Record<DocCollection, ReturnType<typeof docCollection>>;

export default config({
  storage:
    keystatic.kind === 'github'
      ? { kind: 'github', repo: keystatic.repo }
      : { kind: 'local' },

  collections: {
    ...docs,
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
