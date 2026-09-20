import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { glob } from 'astro/loaders';
import { stripHtml } from './utils/sanitize';

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

/** CMS-entered prose is shown as text, so tags are stripped once, here. */
const plainText = z.string().transform(stripHtml);

const spreadsheets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/spreadsheets' }),
  schema: z.object({
    title: z.string(),
    description: plainText,
    url: z.string(),
  }),
});

const whitepapers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/whitepapers' }),
  schema: z.object({
    title: z.string(),
    description: plainText,
    readLink: z.string().optional(),
    btnTitle: z.string().optional(),
    btnLink: z.string().optional(),
  }),
});

export const collections = { articles, reference, spreadsheets, whitepapers };
