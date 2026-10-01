import DOMPurify from 'dompurify';

/**
 * Sanitizes rich-text HTML (Tiptap output) for safe rendering with v-html.
 * Keeps formatting tags, strips scripts/styles/event handlers/foreign objects.
 */
export function sanitizeRichText(html: string): string {
  if (typeof window === 'undefined') return html;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h2', 'h3', 'blockquote', 'ul', 'ol', 'li',
    ],
    ALLOWED_ATTR: ['data-placeholder'],
    KEEP_CONTENT: true,
  });
}

/**
 * Converts rich-text HTML to plain text (for search snippets,
 * version comparison and history summaries).
 */
export function richTextToPlainText(html: string): string {
  if (!html) return '';

  const withBreaks = sanitizeRichText(html)
    .replace(/<[^>]*>/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  return withBreaks
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}