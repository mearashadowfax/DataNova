import type { MarkdownHeading } from 'astro';
import type { Thing, WithContext } from 'schema-dts';
import { feedbackSlug } from '@/feedback/store';
import { supportTrail, type Crumb } from '@/navigation';
import { site as company } from '@/site';
import { getReadingTime } from '@/utils/reading-time';

/**
 * A support document is a Markdoc entry in one of the doc collections.
 * Everything a doc page derives from an entry – table of contents, reading
 * time, SEO, schema.org, breadcrumbs, feedback slug – is computed here, once,
 * for every collection.
 */

export const docCollections = {
  articles: {
    label: 'Articles',
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
  feedbackSlug: string;
  seo: { title: string; description: string };
  schema: WithContext<Thing>;
}

/**
 * Everything a doc page derives from a content entry. Pure, so the table of
 * contents, feedback slug, SEO and schema.org rules are tested once and hold
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
    feedbackSlug: feedbackSlug(collection, id),
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
