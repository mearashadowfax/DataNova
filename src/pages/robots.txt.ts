import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: string) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(
    'sitemap-index.xml',
    site ?? 'https://data-nova.vercel.app'
  );
  return new Response(getRobotsTxt(sitemapURL.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
