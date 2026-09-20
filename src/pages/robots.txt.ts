import type { APIRoute } from 'astro';
import { site } from '@/site';

const getRobotsTxt = (sitemapURL: string) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL}
`;

export const GET: APIRoute = () => {
  const sitemapURL = new URL('sitemap-index.xml', site.url);
  return new Response(getRobotsTxt(sitemapURL.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
