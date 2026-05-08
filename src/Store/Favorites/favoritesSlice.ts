import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favoritesApiService } from '../../Services/FavoritesApiService';

export interface FavoritesState {
  favoriteEventIds: number[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: FavoritesState = {
  favoriteEventIds: [],
  status: 'idle',
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoritesApiService.getFavorites();
      return response.favorites.map((f) => f.event_id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (eventId: number, { rejectWithValue }) => {
    try {
      await favoritesApiService.addFavorite(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(eventId);
    }
  },
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (eventId: number, { rejectWithValue }) => {
    try {
      await favoritesApiService.removeFavorite(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(eventId);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites(state) {
      state.favoriteEventIds = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // fetchFavorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.favoriteEventIds = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.status = 'error';
      });

    // addFavorite — optimistic add on pending, rollback on rejected
    builder
      .addCase(addFavorite.pending, (state, action) => {
        const eventId = action.meta.arg;
        if (!state.favoriteEventIds.includes(eventId)) {
          state.favoriteEventIds.push(eventId);
        }
      })
      .addCase(addFavorite.fulfilled, (state, action: PayloadAction<number>) => {
        // Already added optimistically; ensure it's present
        if (!state.favoriteEventIds.includes(action.payload)) {
          state.favoriteEventIds.push(action.payload);
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        // Rollback — remove the optimistically added ID
        const eventId = action.meta.arg;
        state.favoriteEventIds = state.favoriteEventIds.filter((id) => id !== eventId);
      });

    // removeFavorite — optimistic remove on pending, rollback on rejected
    builder
      .addCase(removeFavorite.pending, (state, action) => {
        const eventId = action.meta.arg;
        state.favoriteEventIds = state.favoriteEventIds.filter((id) => id !== eventId);
      })
      .addCase(removeFavorite.fulfilled, (state, action: PayloadAction<number>) => {
        // Already removed optimistically; ensure it's absent
        state.favoriteEventIds = state.favoriteEventIds.filter((id) => id !== action.payload);
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        // Rollback — re-add the optimistically removed ID
        const eventId = action.meta.arg;
        if (!state.favoriteEventIds.includes(eventId)) {
          state.favoriteEventIds.push(eventId);
        }
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectFavoriteEventIds = (state: { favorites: FavoritesState }): number[] =>
  state.favorites.favoriteEventIds;

export const selectIsFavorited =
  (eventId: number) =>
  (state: { favorites: FavoritesState }): boolean =>
    state.favorites.favoriteEventIds.includes(eventId);

export const selectFavoritesStatus = (state: {
  favorites: FavoritesState;
}): FavoritesState['status'] => state.favorites.status;

export default favoritesSlice.reducer;
