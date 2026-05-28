import type { AgencyImage } from '../../Modules/Home/types/home.types';

const mockConfig = {
  ALLOW_DEV_MOCK_IMAGES: undefined as string | undefined,
};

jest.mock('../../config', () => ({
  __esModule: true,
  config: mockConfig,
  default: mockConfig,
}));

const STORAGE_KEY = 'FRESHTRAK_DEV_MOCK_IMAGES';
const originalNodeEnv = process.env.NODE_ENV;

const setHostname = (hostname: string): void => {
  Object.defineProperty(window, 'location', {
    value: { hostname },
    writable: true,
    configurable: true,
  });
};

const loadModule = () => require('../devImageEnrichment') as typeof import('../devImageEnrichment');

describe('devImageEnrichment', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    localStorage.clear();
    mockConfig.ALLOW_DEV_MOCK_IMAGES = undefined;
    setHostname('freshtrak.com');
    process.env.NODE_ENV = 'production';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('isDevMockImagesEnabled', () => {
    it('returns true in local development when localStorage opt-in is set', () => {
      process.env.NODE_ENV = 'development';
      localStorage.setItem(STORAGE_KEY, 'true');

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(true);
    });

    it('returns false in local development without localStorage opt-in', () => {
      process.env.NODE_ENV = 'development';

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(false);
    });

    it('returns false on production even with localStorage opt-in', () => {
      setHostname('freshtrak.com');
      localStorage.setItem(STORAGE_KEY, 'true');

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(false);
    });

    it('returns false on beta2 without runtime allow flag', () => {
      setHostname('beta2.freshtrak.com');
      localStorage.setItem(STORAGE_KEY, 'true');

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(false);
    });

    it('returns true on beta2 with runtime allow flag and localStorage opt-in', () => {
      setHostname('beta2.freshtrak.com');
      mockConfig.ALLOW_DEV_MOCK_IMAGES = 'true';
      localStorage.setItem(STORAGE_KEY, 'true');

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(true);
    });

    it('returns true on localhost preview with localStorage opt-in', () => {
      setHostname('localhost');
      localStorage.setItem(STORAGE_KEY, 'true');

      const { isDevMockImagesEnabled } = loadModule();

      expect(isDevMockImagesEnabled()).toBe(true);
    });
  });

  describe('enrichEventWithMockImages', () => {
    it('does not enrich events when mock images are disabled', () => {
      const event = { id: '123', agencyImages: [], eventImages: [] };

      const { enrichEventWithMockImages } = loadModule();
      const result = enrichEventWithMockImages(event);

      expect(result).toEqual(event);
    });

    it('adds mock images when enabled and event has no images', () => {
      process.env.NODE_ENV = 'development';
      localStorage.setItem(STORAGE_KEY, 'true');

      const { enrichEventWithMockImages } = loadModule();
      const result = enrichEventWithMockImages({
        id: '123',
        agencyImages: [],
        eventImages: [],
      });

      expect(
        (result.agencyImages?.length ?? 0) + (result.eventImages?.length ?? 0),
      ).toBeGreaterThan(0);
    });

    it('does not replace existing agency or event images', () => {
      process.env.NODE_ENV = 'development';
      localStorage.setItem(STORAGE_KEY, 'true');

      const existingAgencyImages: AgencyImage[] = [
        { id: 1, type: 'Logo', caption: 'Real logo', src: '/real.png' },
      ];
      const existingEventImages: AgencyImage[] = [
        { id: 2, type: 'Instructions', caption: 'Real map', src: '/map.png' },
      ];

      const { enrichEventWithMockImages } = loadModule();
      const result = enrichEventWithMockImages({
        id: '123',
        agencyImages: existingAgencyImages,
        eventImages: existingEventImages,
      });

      expect(result.agencyImages).toEqual(existingAgencyImages);
      expect(result.eventImages).toEqual(existingEventImages);
    });
  });
});
