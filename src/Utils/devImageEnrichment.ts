/**
 * Dev-only utility that injects mock images into events for visual testing.
 *
 * Security model (all layers must pass before mock images appear):
 * 1. Environment allowlist — local dev, localhost preview, or beta2 with runtime flag
 * 2. Explicit opt-in — localStorage key must be set via browser console
 * 3. Non-destructive — only fills in missing images; never replaces real API data
 *
 * Enable on beta2 (requires REACT_APP_ALLOW_DEV_MOCK_IMAGES=true on that deployment):
 *   localStorage.setItem('FRESHTRAK_DEV_MOCK_IMAGES', 'true')
 *   localStorage.removeItem('FRESHTRAK_DEV_MOCK_IMAGES')  // disable
 *
 * Then refresh the page.
 */

import { config } from '../config';

import type { AgencyImage } from '../Modules/Home/types/home.types';

const STORAGE_KEY = 'FRESHTRAK_DEV_MOCK_IMAGES';

/** Non-production hostnames where mock images may be enabled in built environments. */
const MOCK_IMAGES_ALLOWED_HOSTNAMES = new Set(['localhost', '127.0.0.1', 'beta2.freshtrak.com']);

function getHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hostname;
}

function isMockImagesEnvironmentAllowed(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const hostname = getHostname();
  if (!hostname || !MOCK_IMAGES_ALLOWED_HOSTNAMES.has(hostname)) {
    return false;
  }

  if (hostname === 'beta2.freshtrak.com') {
    return config.ALLOW_DEV_MOCK_IMAGES === 'true';
  }

  return true;
}

export function isDevMockImagesEnabled(): boolean {
  if (!isMockImagesEnvironmentAllowed()) return false;

  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

const PLACEHOLDER_PHOTOS: string[] = [
  'https://picsum.photos/seed/agency-logo/400/300',
  'https://picsum.photos/seed/agency-building/400/300',
  'https://picsum.photos/seed/agency-entrance/400/300',
  'https://picsum.photos/seed/event-checkin/400/300',
  'https://picsum.photos/seed/event-instructions/400/300',
  'https://picsum.photos/seed/event-map/400/300',
  'https://picsum.photos/seed/event-parking/400/300',
  'https://picsum.photos/seed/agency-banner/400/300',
];

const AGENCY_IMAGE_TEMPLATES: Omit<AgencyImage, 'id'>[] = [
  { type: 'Logo', caption: 'Agency logo', src: PLACEHOLDER_PHOTOS[0] },
  { type: 'Building', caption: 'Main building entrance', src: PLACEHOLDER_PHOTOS[1] },
  { type: 'Building', caption: 'Side entrance with ramp', src: PLACEHOLDER_PHOTOS[2] },
  { type: 'Building', caption: 'Agency banner', src: PLACEHOLDER_PHOTOS[7] },
];

const EVENT_IMAGE_TEMPLATES: Omit<AgencyImage, 'id'>[] = [
  { type: 'Instructions', caption: 'Check-in process', src: PLACEHOLDER_PHOTOS[3] },
  { type: 'Instructions', caption: 'Where to line up', src: PLACEHOLDER_PHOTOS[4] },
  { type: 'Instructions', caption: 'Site map', src: PLACEHOLDER_PHOTOS[5] },
  { type: 'Instructions', caption: 'Parking area', src: PLACEHOLDER_PHOTOS[6] },
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministically pick a subset of templates based on a seed string.
 * This ensures the same event always gets the same mock images.
 */
function pickImages(
  templates: Omit<AgencyImage, 'id'>[],
  seed: string,
  idOffset: number,
): AgencyImage[] {
  const hash = simpleHash(seed);
  const count = (hash % templates.length) + 1;
  return templates.slice(0, count).map((tpl, i) => ({
    ...tpl,
    id: idOffset + i + 9000,
  }));
}

interface EnrichableEvent {
  id?: string | number;
  eventId?: string | number;
  eventName?: string;
  agencyImages?: AgencyImage[];
  eventImages?: AgencyImage[];
  [key: string]: unknown;
}

/**
 * Enrich a single formatted event with mock images.
 * Uses the event id as seed so results are stable across renders.
 */
export function enrichEventWithMockImages<T extends EnrichableEvent>(event: T): T {
  if (!isDevMockImagesEnabled()) return event;

  const seed = String(event.id ?? event.eventId ?? 'unknown');
  const hash = simpleHash(seed);

  const variant = hash % 4;

  let agencyImages: AgencyImage[];
  let eventImages: AgencyImage[];

  switch (variant) {
    case 0:
      agencyImages = pickImages(AGENCY_IMAGE_TEMPLATES, `agency-${seed}`, 0);
      eventImages = [];
      break;
    case 1:
      agencyImages = [];
      eventImages = pickImages(EVENT_IMAGE_TEMPLATES, `event-${seed}`, 100);
      break;
    case 2:
      agencyImages = pickImages(AGENCY_IMAGE_TEMPLATES, `agency-${seed}`, 0);
      eventImages = pickImages(EVENT_IMAGE_TEMPLATES, `event-${seed}`, 100);
      break;
    case 3:
    default:
      agencyImages = AGENCY_IMAGE_TEMPLATES.map((tpl, i) => ({ ...tpl, id: 9000 + i }));
      eventImages = EVENT_IMAGE_TEMPLATES.map((tpl, i) => ({ ...tpl, id: 9100 + i }));
      break;
  }

  return {
    ...event,
    agencyImages: event.agencyImages?.length ? event.agencyImages : agencyImages,
    eventImages: event.eventImages?.length ? event.eventImages : eventImages,
  };
}
