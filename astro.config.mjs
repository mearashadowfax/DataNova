// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.ts';

// https://astro.build/config
export default defineConfig({
  // The site's base URL lives in src/site.ts – update it there before deploying.
  site: site.url.href,
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
