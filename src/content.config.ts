import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { glob } from 'astro/loaders';
import {
  docCollections,
  docFrontmatter,
  type DocCollection,
} from './support/collections';

/** Every field in `docFrontmatter`; `satisfies` fails when one is missing. */
const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
} satisfies Record<keyof typeof docFrontmatter, z.ZodType>);

/** Markdoc support documents: every doc collection shares one shape. */
function docCollection(dir: string) {
  return defineCollection({
    loader: glob({
      pattern: ['**/*.md', '**/*.mdx', '**/*.mdoc'],
      base: `./src/content/${dir}`,
    }),
    schema: frontmatterSchema,
  });
}

const docs = Object.fromEntries(
  Object.entries(docCollections).map(([name, { dir }]) => [
    name,
    docCollection(dir),
  ])
) as Record<DocCollection, ReturnType<typeof docCollection>>;

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

export const collections = { ...docs, spreadsheets, whitepapers };
