/**
 * Thin wrappers around browser globals that need to be mockable in tests.
 * Keeping these isolated avoids the non-configurable window.location problem
 * in jsdom, where Object.defineProperty and jest.spyOn both fail.
 */

export const getWindowHostname = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.location.hostname;
};
