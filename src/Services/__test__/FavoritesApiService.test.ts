/**
 * FavoritesApiService tests
 *
 * NOTE: `jest.mock` factories are hoisted before imports, so we define the
 * axios mock instance INSIDE the factory to avoid Temporal Dead Zone issues
 * with `const` declarations. We retrieve the instance later via `getMockInstance`.
 */

// ─── Axios mock (must be declared before any imports that trigger module init) ─
import { FavoritesApiService } from '../FavoritesApiService';

let getMockInstance: () => {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
  interceptors: { request: { use: jest.Mock } };
};

jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  // Expose the instance so tests can access it after hoisting
  (global as any).__mockAxiosInstance = mockInstance;
  return { ...jest.requireActual('axios'), create: jest.fn(() => mockInstance) };
});

jest.mock('../../Utils/Urls', () => ({
  API_URL: {
    FAVORITES: 'https://reg-api.example.com/api/favorites',
    FAVORITE_BY_EVENT: (eventId: number) => `https://reg-api.example.com/api/favorites/${eventId}`,
  },
}));

jest.mock('../../config', () => ({
  default: { REGISTRATION_API: 'https://reg-api.example.com' },
}));

const mockGetCognitoUser = jest.fn();
jest.mock('../../Utils/StorageService', () => ({
  StorageService: {
    getCognitoUser: (...args: any[]) => mockGetCognitoUser(...args),
  },
}));

// Resolve the mock instance (set up in the factory above)
const mockAxios = () => (global as any).__mockAxiosInstance as ReturnType<typeof getMockInstance>;

describe('FavoritesApiService', () => {
  let service: FavoritesApiService;

  beforeEach(() => {
    const instance = mockAxios();
    instance.get.mockReset();
    instance.post.mockReset();
    instance.delete.mockReset();
    mockGetCognitoUser.mockReset();
    mockGetCognitoUser.mockReturnValue({ accessToken: 'mock-token' });
    service = new FavoritesApiService();
  });

  describe('getFavorites', () => {
    it('returns favorites list on success', async () => {
      mockAxios().get.mockResolvedValueOnce({
        data: {
          favorites: [
            { id: 1, event_id: 101, created_at: '2026-01-01T00:00:00Z' },
            { id: 2, event_id: 202, created_at: '2026-01-02T00:00:00Z' },
          ],
        },
      });

      const result = await service.getFavorites();

      expect(mockAxios().get).toHaveBeenCalledWith('https://reg-api.example.com/api/favorites');
      expect(result.favorites).toHaveLength(2);
      expect(result.favorites[0].event_id).toBe(101);
    });

    it('throws a parsed error on API failure', async () => {
      mockAxios().get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
        message: 'Request failed with status code 401',
      });

      await expect(service.getFavorites()).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('throws a network error when no response', async () => {
      mockAxios().get.mockRejectedValueOnce({ message: 'Network Error' });

      await expect(service.getFavorites()).rejects.toMatchObject({
        status: 0,
        message: 'Network Error',
      });
    });
  });

  describe('addFavorite', () => {
    it('posts correct payload and returns created record', async () => {
      mockAxios().post.mockResolvedValueOnce({
        data: { id: 10, user_id: 5, event_id: 303, created_at: '2026-05-01T00:00:00Z' },
      });

      const result = await service.addFavorite(303);

      expect(mockAxios().post).toHaveBeenCalledWith('https://reg-api.example.com/api/favorites', {
        event_id: 303,
      });
      expect(result.event_id).toBe(303);
    });

    it('throws a parsed error on 409 conflict', async () => {
      mockAxios().post.mockRejectedValueOnce({
        response: { status: 409, data: { message: 'Already favorited' } },
        message: 'Request failed with status code 409',
      });

      await expect(service.addFavorite(303)).rejects.toMatchObject({
        status: 409,
        message: 'Already favorited',
      });
    });

    it('throws on network failure', async () => {
      mockAxios().post.mockRejectedValueOnce({ message: 'Network Error' });
      await expect(service.addFavorite(303)).rejects.toMatchObject({ status: 0 });
    });
  });

  describe('removeFavorite', () => {
    it('calls DELETE with the correct event ID URL', async () => {
      mockAxios().delete.mockResolvedValueOnce({ data: undefined });

      await service.removeFavorite(404);

      expect(mockAxios().delete).toHaveBeenCalledWith(
        'https://reg-api.example.com/api/favorites/404',
      );
    });

    it('resolves without a return value on success', async () => {
      mockAxios().delete.mockResolvedValueOnce({ data: undefined });
      await expect(service.removeFavorite(404)).resolves.toBeUndefined();
    });

    it('throws a parsed error on 404 not found', async () => {
      mockAxios().delete.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Favorite not found' } },
        message: 'Request failed with status code 404',
      });

      await expect(service.removeFavorite(999)).rejects.toMatchObject({
        status: 404,
        message: 'Favorite not found',
      });
    });

    it('throws on network failure', async () => {
      mockAxios().delete.mockRejectedValueOnce({ message: 'Network Error' });
      await expect(service.removeFavorite(404)).rejects.toMatchObject({ status: 0 });
    });
  });
});
