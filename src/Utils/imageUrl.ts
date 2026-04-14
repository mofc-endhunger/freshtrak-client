import config from '../config';

/**
 * Resolves an image `src` from the API into a full URL.
 *
 * - Absolute URLs (http/https) are returned as-is.
 * - Relative paths (e.g. "/agency_pics/foo.png") are prefixed with the
 *   configured IMAGES_BASE_URL.
 */
export function resolveImageUrl(src: string): string {
  if (!src) return '';

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  const base = config.IMAGES_BASE_URL.replace(/\/+$/, '');
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${base}${path}`;
}
