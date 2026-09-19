import { getCollection, getEntry, render } from 'astro:content';
import { describeDoc, type DocCollection, type DocMeta } from './docs';

export type LoadedDoc = DocMeta & {
  Content: Awaited<ReturnType<typeof render>>['Content'];
};

/** Load and describe one document, or `null` when it does not exist. */
export async function loadDoc(
  collection: DocCollection,
  id: string | undefined,
  { url, site }: { url: URL; site: URL | undefined }
): Promise<LoadedDoc | null> {
  if (!id) return null;

  const entry = await getEntry(collection, id);
  if (!entry) return null;

  const { Content, headings } = await render(entry);
  return {
    Content,
    ...describeDoc({
      collection,
      id,
      data: entry.data,
      body: entry.body,
      headings,
      url,
      site,
    }),
  };
}

/** All documents in a collection, newest first. */
export async function listDocs(collection: DocCollection) {
  const entries = await getCollection(collection);
  return entries.toSorted(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}
