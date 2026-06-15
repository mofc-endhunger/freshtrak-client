import DOMPurify from 'dompurify';

/**
 * Allowed tags for rich event content (links, basic formatting).
 * Used for eventDetails and exceptionNote to support embedded HTML from the database.
 */
const ALLOWED_TAGS = [
  'a',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'span',
  'div',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Sanitizes HTML for safe display in event cards, confirmation views, and fb_text section.
 * Allows links and basic formatting; strips scripts and dangerous markup.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || !html.trim()) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
  });
}
