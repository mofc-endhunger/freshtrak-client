import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './Events/eventSlice';
import searchAddressReducer from './Search/searchSlice';
import userReducer from './userSlice';
import languageReducer from './languageSlice';
import { AppState } from '../types';

const store = configureStore({
  reducer: {
    event: eventReducer,
    addressSearch: searchAddressReducer,
    user: userReducer,
    language: languageReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 