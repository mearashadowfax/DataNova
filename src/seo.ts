import type { Thing, WithContext } from 'schema-dts';
import { site } from '@/site';

/**
 * Everything the layout's <head> needs for one page, derived from a title and
 * a description. The title-suffix rule, the WebSite block that every page's
 * schema.org data is part of, and the social-card fields live here once.
 */

export type PageKind = 'WebPage' | 'ContactPage' | 'Article' | 'TechArticle';

export interface PageMeta {
  /** Full document title, brand suffix applied. */
  title: string;
  description: string;
  schema: WithContext<Thing>;
}

/** The site itself, as schema.org sees it; every page's `isPartOf`. */
export function websiteSchema() {
  return {
    '@type': 'WebSite' as const,
    url: site.url.href,
    name: site.brand,
    description: site.tagline,
  };
}

/** `"About"` → `"About - DataNova"`; titles that already name the brand are kept. */
export function pageTitle(title?: string): string {
  if (!title) return `${site.brand} - ${site.headline}`;
  return title.includes(site.brand) ? title : `${title} - ${site.brand}`;
}

export function describePage({
  title,
  description = site.summary,
  kind = 'WebPage',
  url,
  extra = {},
}: {
  title?: string;
  description?: string;
  kind?: PageKind;
  /** The page's own URL (`Astro.url`). */
  url: URL;
  /** Extra schema.org fields for the page type, e.g. `datePublished`. */
  extra?: Record<string, unknown>;
}): PageMeta {
  const fullTitle = pageTitle(title);
  return {
    title: fullTitle,
    description,
    schema: {
      '@context': 'https://schema.org',
      '@type': kind,
      inLanguage: 'en-US',
      '@id': url.href,
      url: url.href,
      name: title ?? site.brand,
      description,
      isPartOf: websiteSchema(),
      ...extra,
    } as WithContext<Thing>,
  };
}
