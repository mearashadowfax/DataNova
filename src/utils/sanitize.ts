/** Escape HTML special characters for safe text insertion. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Strip tags and decode common entities for plain-text display of CMS fields.
 * Tag removal is repeated until stable, then any leftover angle brackets are
 * dropped so nested or unclosed tags cannot survive. Entity decoding applies
 * `&amp;` last to avoid double-unescaping.
 */
export function stripHtml(value: string): string {
  let text = value;
  let previous: string;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, '');
  } while (text !== previous);

  text = text.replace(/[<>]/g, '');

  return text
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .trim();
}
