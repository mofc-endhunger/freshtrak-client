import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'freshtrak_language';

function loadPersistedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export const languageSlice = createSlice({
  name: 'language',
  initialState: {
    language: loadPersistedLanguage()
  },
  reducers: {
    setCurrentLanguage(state, action) {
      state.language = action.payload;
      try { localStorage.setItem(STORAGE_KEY, action.payload); } catch { /* noop */ }
    },
  }
});

export const { setCurrentLanguage } = languageSlice.actions;
export const selectLanguage = state => state.language.language;
export default languageSlice.reducer;
