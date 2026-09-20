import { existsSync } from 'node:fs';

/**
 * Whether an internal href is served by Astro's file routing:
 * `/a/b` → `src/pages/a/b.astro` or `src/pages/a/b/index.astro`.
 * Placeholder (`#`) and external links count as resolved.
 */
export function pageExists(href: string): boolean {
  if (href === '#' || !href.startsWith('/')) return true;
  return (
    existsSync(`src/pages${href}.astro`) ||
    existsSync(`src/pages${href}/index.astro`)
  );
}
