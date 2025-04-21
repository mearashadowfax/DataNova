// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  // The `site` property specifies the base URL for your site.
  // Be sure to update this to your own domain (e.g., "https://yourdomain.com") before deploying.
  site: "https://data-nova.vercel.app",
  prefetch: true,
  trailingSlash: "never",
  experimental: {
    clientPrerender: true,
  },
  integrations: [
    markdoc(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "static",
});
