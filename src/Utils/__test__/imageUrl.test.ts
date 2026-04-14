import { resolveImageUrl } from '../imageUrl';

jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    IMAGES_BASE_URL: 'https://images.pantrytrak.com',
  },
}));

describe('resolveImageUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty string for empty src', () => {
    expect(resolveImageUrl('')).toBe('');
  });

  it('returns absolute http URLs as-is', () => {
    const url = 'http://example.com/image.png';
    expect(resolveImageUrl(url)).toBe(url);
  });

  it('returns absolute https URLs as-is', () => {
    const url = 'https://cdn.example.com/photos/pic.jpg';
    expect(resolveImageUrl(url)).toBe(url);
  });

  it('prepends base URL to relative paths starting with /', () => {
    expect(resolveImageUrl('/agency_pics/test.png')).toBe(
      'https://images.pantrytrak.com/agency_pics/test.png',
    );
  });

  it('prepends base URL with leading slash for paths without /', () => {
    expect(resolveImageUrl('agency_pics/test.png')).toBe(
      'https://images.pantrytrak.com/agency_pics/test.png',
    );
  });
});
