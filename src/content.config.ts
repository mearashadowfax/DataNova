import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { glob } from 'astro/loaders';

/** Markdoc support documents – articles and reference share one shape. */
function docCollection(dir: string) {
  return defineCollection({
    loader: glob({
      pattern: ['**/*.md', '**/*.mdx', '**/*.mdoc'],
      base: `./src/content/${dir}`,
    }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
    }),
  });
}

const articles = docCollection('articles');
const reference = docCollection('reference');

const spreadsheets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/spreadsheets' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
  }),
});

const whitepapers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/whitepapers' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    readLink: z.string().optional(),
    btnTitle: z.string().optional(),
    btnLink: z.string().optional(),
  }),
});

export const collections = { articles, reference, spreadsheets, whitepapers };
