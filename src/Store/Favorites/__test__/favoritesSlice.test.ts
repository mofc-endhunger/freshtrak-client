import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer, {
  clearFavorites,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  selectFavoriteEventIds,
  selectIsFavorited,
  selectFavoritesStatus,
  FavoritesState,
} from '../favoritesSlice';

import { favoritesApiService } from '../../../Services/FavoritesApiService';

jest.mock('../../../Services/FavoritesApiService', () => ({
  favoritesApiService: {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  },
}));
const mockApi = favoritesApiService as jest.Mocked<typeof favoritesApiService>;

const buildStore = (preloadedState?: Partial<{ favorites: FavoritesState }>) =>
  configureStore({
    reducer: { favorites: favoritesReducer },
    preloadedState,
  });

describe('favoritesSlice', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Reducer / sync actions ───────────────────────────────────────────────

  describe('clearFavorites', () => {
    it('resets state to initial', () => {
      const store = buildStore({
        favorites: { favoriteEventIds: [1, 2, 3], status: 'idle' },
      });
      store.dispatch(clearFavorites());
      const state = store.getState().favorites;
      expect(state.favoriteEventIds).toEqual([]);
      expect(state.status).toBe('idle');
    });
  });

  // ─── fetchFavorites ───────────────────────────────────────────────────────

  describe('fetchFavorites', () => {
    it('sets status to loading on pending', () => {
      const store = buildStore();
      // Simulate pending by dispatching without resolving
      mockApi.getFavorites.mockReturnValue(new Promise(() => {}));
      store.dispatch(fetchFavorites());
      expect(store.getState().favorites.status).toBe('loading');
    });

    it('populates favoriteEventIds on fulfilled', async () => {
      mockApi.getFavorites.mockResolvedValueOnce({
        favorites: [
          { id: 1, event_id: 101, created_at: '2026-01-01' },
          { id: 2, event_id: 202, created_at: '2026-01-02' },
        ],
      });
      const store = buildStore();
      await store.dispatch(fetchFavorites());
      const state = store.getState().favorites;
      expect(state.favoriteEventIds).toEqual([101, 202]);
      expect(state.status).toBe('idle');
    });

    it('sets status to error on rejected', async () => {
      mockApi.getFavorites.mockRejectedValueOnce({ status: 500, message: 'Server error' });
      const store = buildStore();
      await store.dispatch(fetchFavorites());
      expect(store.getState().favorites.status).toBe('error');
    });
  });

  // ─── addFavorite ──────────────────────────────────────────────────────────

  describe('addFavorite', () => {
    it('adds eventId optimistically on pending', () => {
      const store = buildStore({ favorites: { favoriteEventIds: [], status: 'idle' } });
      mockApi.addFavorite.mockReturnValue(new Promise(() => {}));
      store.dispatch(addFavorite(303));
      expect(store.getState().favorites.favoriteEventIds).toContain(303);
    });

    it('keeps eventId in list on fulfilled', async () => {
      mockApi.addFavorite.mockResolvedValueOnce({
        id: 10,
        user_id: 5,
        event_id: 303,
        created_at: '2026-05-01',
      });
      const store = buildStore({ favorites: { favoriteEventIds: [], status: 'idle' } });
      await store.dispatch(addFavorite(303));
      expect(store.getState().favorites.favoriteEventIds).toContain(303);
    });

    it('rolls back (removes) the eventId on rejected', async () => {
      mockApi.addFavorite.mockRejectedValueOnce({ status: 500, message: 'Server error' });
      const store = buildStore({ favorites: { favoriteEventIds: [], status: 'idle' } });
      await store.dispatch(addFavorite(303));
      expect(store.getState().favorites.favoriteEventIds).not.toContain(303);
    });

    it('does not add duplicate eventId if already favorited', () => {
      const store = buildStore({ favorites: { favoriteEventIds: [303], status: 'idle' } });
      mockApi.addFavorite.mockReturnValue(new Promise(() => {}));
      store.dispatch(addFavorite(303));
      expect(store.getState().favorites.favoriteEventIds.filter((id) => id === 303)).toHaveLength(
        1,
      );
    });
  });

  // ─── removeFavorite ───────────────────────────────────────────────────────

  describe('removeFavorite', () => {
    it('removes eventId optimistically on pending', () => {
      const store = buildStore({ favorites: { favoriteEventIds: [404], status: 'idle' } });
      mockApi.removeFavorite.mockReturnValue(new Promise(() => {}));
      store.dispatch(removeFavorite(404));
      expect(store.getState().favorites.favoriteEventIds).not.toContain(404);
    });

    it('keeps eventId absent on fulfilled', async () => {
      mockApi.removeFavorite.mockResolvedValueOnce(undefined);
      const store = buildStore({ favorites: { favoriteEventIds: [404], status: 'idle' } });
      await store.dispatch(removeFavorite(404));
      expect(store.getState().favorites.favoriteEventIds).not.toContain(404);
    });

    it('rolls back (re-adds) the eventId on rejected', async () => {
      mockApi.removeFavorite.mockRejectedValueOnce({ status: 500, message: 'Server error' });
      const store = buildStore({ favorites: { favoriteEventIds: [404], status: 'idle' } });
      await store.dispatch(removeFavorite(404));
      expect(store.getState().favorites.favoriteEventIds).toContain(404);
    });
  });

  // ─── Selectors ────────────────────────────────────────────────────────────

  describe('selectors', () => {
    const preloadedState = { favorites: { favoriteEventIds: [1, 2, 3], status: 'idle' as const } };

    it('selectFavoriteEventIds returns the full list', () => {
      const store = buildStore(preloadedState);
      expect(selectFavoriteEventIds(store.getState())).toEqual([1, 2, 3]);
    });

    it('selectIsFavorited returns true for a favorited eventId', () => {
      const store = buildStore(preloadedState);
      expect(selectIsFavorited(2)(store.getState())).toBe(true);
    });

    it('selectIsFavorited returns false for a non-favorited eventId', () => {
      const store = buildStore(preloadedState);
      expect(selectIsFavorited(99)(store.getState())).toBe(false);
    });

    it('selectFavoritesStatus returns current status', () => {
      const store = buildStore({ favorites: { favoriteEventIds: [], status: 'loading' } });
      expect(selectFavoritesStatus(store.getState())).toBe('loading');
    });
  });
});
