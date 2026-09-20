import { getCollection, render, type CollectionEntry } from 'astro:content';
import { describeDoc, type DocCollection, type DocMeta } from './docs';

export type DocEntry = CollectionEntry<DocCollection>;

export type LoadedDoc = DocMeta & {
  Content: Awaited<ReturnType<typeof render>>['Content'];
};

/** `getStaticPaths` for a doc collection: one page per entry, entry passed as a prop. */
export async function docPaths(collection: DocCollection) {
  const entries = await getCollection(collection);
  return entries.map(entry => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

/** Render and describe one document from its content entry. */
export async function loadDoc(entry: DocEntry, url: URL): Promise<LoadedDoc> {
  const { Content, headings } = await render(entry);
  return {
    Content,
    ...describeDoc({
      collection: entry.collection,
      id: entry.id,
      data: entry.data,
      body: entry.body,
      headings,
      url,
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
