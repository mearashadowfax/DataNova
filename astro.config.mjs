// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The `site` property specifies the base URL for your site.
  // Be sure to update this to your own domain (e.g., "https://yourdomain.com") before deploying.
  site: 'https://data-nova.vercel.app',
  prefetch: true,
  trailingSlash: 'never',
  // Preserve spaces between inline elements (nav/footer) after Astro 7 jsx default
  compressHTML: true,
  experimental: {
    clientPrerender: true,
  },
  integrations: [markdoc(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
