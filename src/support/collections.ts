/**
 * The doc collections, declared once.
 *
 * Astro's content loader (`src/content.config.ts`), the Keystatic admin
 * (`keystatic.config.ts`) and the doc pages (`./docs.ts`) all derive their
 * view of a collection from here, so adding a collection or a frontmatter
 * field is one edit.
 *
 * Plain data with no imports: Keystatic bundles this for the browser and
 * `content.config.ts` loads it outside the `@/` alias.
 */

export const docCollections = {
  articles: {
    label: 'Articles',
    /** Folder under `src/content/` and `src/assets/images/`. */
    dir: 'articles',
    basePath: '/support/articles',
    schemaType: 'Article',
    empty: {
      title: 'No articles yet',
      description:
        'Add articles in Keystatic or src/content/articles to populate this list.',
    },
  },
  reference: {
    label: 'Reference',
    dir: 'reference',
    basePath: '/support/reference',
    schemaType: 'TechArticle',
    empty: {
      title: 'No reference docs yet',
      description:
        'Add reference entries in Keystatic or src/content/reference to populate this list.',
    },
  },
} as const;

export type DocCollection = keyof typeof docCollections;

export const docCollectionNames = Object.keys(docCollections) as [
  DocCollection,
  ...DocCollection[],
];

/** One support document: ids are unique within a collection, not across them. */
export interface DocRef {
  collection: DocCollection;
  id: string;
}

/**
 * A document's string key, `collection/id`. Feedback rows (and migration
 * 0001) and the widget's saved choice in localStorage are both keyed by it.
 */
export function docKey({ collection, id }: DocRef): string {
  return `${collection}/${id}`;
}

/**
 * Frontmatter every support document carries. `title` is the field Keystatic
 * derives the file name from; every field is required.
 */
export const docFrontmatter = {
  title: { kind: 'title', label: 'Title' },
  description: { kind: 'text', label: 'Description' },
  date: {
    kind: 'date',
    label: 'Publication date',
    description: 'The date of the publication',
  },
} as const satisfies Record<string, FrontmatterField>;

export interface FrontmatterField {
  kind: 'title' | 'text' | 'date';
  label: string;
  description?: string;
}

interface FieldValue {
  title: string;
  text: string;
  date: Date;
}

/** A document's parsed frontmatter, as Astro's content loader returns it. */
export type DocData = {
  [
    K in keyof typeof docFrontmatter
  ]: FieldValue[(typeof docFrontmatter)[K]['kind']];
};
