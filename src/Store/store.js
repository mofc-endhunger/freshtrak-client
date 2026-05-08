import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import eventReducer from './Events/eventSlice';
import searchAddressReducer from './Search/searchSlice';
import userReducer from './userSlice';
import languageReducer from './languageSlice';
import favoritesReducer from './Favorites/favoritesSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['event', 'user', 'favorites'], // Persist event, user, and favorites state
  blacklist: ['addressSearch', 'language'], // Don't persist search and language state
};

// Create persisted reducers
const persistedEventReducer = persistReducer(persistConfig, eventReducer);
const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedFavoritesReducer = persistReducer(persistConfig, favoritesReducer);

// Create the store
const store = configureStore({
  reducer: {
    event: persistedEventReducer,
    addressSearch: searchAddressReducer,
    user: persistedUserReducer,
    language: languageReducer,
    favorites: persistedFavoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
      },
    }),
});

// Export persistor for use in the app
export const persistor = persistStore(store);

export default store;
