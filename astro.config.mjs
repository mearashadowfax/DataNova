// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
import db from "@astrojs/db";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://datanova.vercel.app",
  prefetch: true,
  trailingSlash: "never",
  experimental: {
    clientPrerender: true,
  },
  integrations: [
    tailwind(),
    react(),
    markdoc(),
    ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
    db(),
    svelte(),
  ],
  output: "server",
  adapter: vercel(),
});
