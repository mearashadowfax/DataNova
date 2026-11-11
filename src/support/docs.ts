import type { MarkdownHeading } from 'astro';
import type { Thing, WithContext } from 'schema-dts';
import { supportTrail, type Crumb } from '@/navigation';
import { site as company } from '@/site';
import { getReadingTime } from '@/utils/reading-time';
import {
  docCollections,
  type DocCollection,
  type DocData,
} from './collections';

/**
 * A support document is a Markdoc entry in one of the doc collections.
 * Everything a doc page derives from an entry – table of contents, reading
 * time, SEO, schema.org, breadcrumbs – is computed here, once, for every
 * collection. The collections themselves are declared in `./collections`.
 */

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
  seo: { title: string; description: string };
  schema: WithContext<Thing>;
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
  site: URL | undefined;
}): DocMeta {
  const { collection, id, data, body, headings, url, site } = input;
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
    seo: { title: data.title, description: data.description },
    schema: {
      '@context': 'https://schema.org',
      '@type': schemaType,
      url: url.href,
      name: data.title,
      description: data.description,
      datePublished: data.date.toISOString().slice(0, 10),
      isPartOf: {
        '@type': 'WebSite',
        url: `${site}`,
        name: company.name,
        description: company.tagline,
      },
    },
  };
}
