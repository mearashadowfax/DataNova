import type { MarkdownHeading } from 'astro';
import { supportTrail, type Crumb } from '@/navigation';
import { supportResources } from './resources';
import { describePage, type PageMeta } from '@/seo';
import { getReadingTime } from '@/utils/reading-time';

/**
 * A support document is a Markdoc entry in one of the doc collections.
 * Everything a doc page derives from an entry – table of contents, reading
 * time, SEO, schema.org, breadcrumbs – is computed here, once,
 * for every collection.
 */

export const docCollections = {
  articles: { ...supportResources.articles, schemaType: 'Article' },
  reference: { ...supportResources.reference, schemaType: 'TechArticle' },
} as const;

export type DocCollection = keyof typeof docCollections;

export interface DocData {
  title: string;
  description: string;
  date: Date;
}

export interface DocMeta {
  collection: DocCollection;
  id: string;
  title: string;
  description: string;
  date: Date;
  /** e.g. "3 min read", or undefined for an empty body. */
  readingTime: string | undefined;
  /** Second-level headings, for the "On this page" list. */
  toc: { slug: string; text: string }[];
  breadcrumbs: Crumb[];
  /** Title, description and schema.org data for the layout. */
  page: PageMeta;
}

/**
 * Everything a doc page derives from a content entry. Pure, so the table of
 * contents, SEO and schema.org rules are tested once and hold
 * for every collection.
 */
export function describeDoc(input: {
  collection: DocCollection;
  id: string;
  data: DocData;
  body: string | undefined;
  headings: MarkdownHeading[];
  url: URL;
}): DocMeta {
  const { collection, id, data, body, headings, url } = input;
  const { label, basePath, schemaType } = docCollections[collection];

  return {
    collection,
    id,
    title: data.title,
    description: data.description,
    date: data.date,
    readingTime: getReadingTime(body ?? ''),
    toc: headings
      .filter(heading => heading.depth === 2)
      .map(({ slug, text }) => ({ slug, text })),
    breadcrumbs: supportTrail({ label, href: basePath }, { label: data.title }),
    page: describePage({
      title: data.title,
      description: data.description,
      kind: schemaType,
      url,
      extra: { datePublished: data.date.toISOString().slice(0, 10) },
    }),
  };
}
