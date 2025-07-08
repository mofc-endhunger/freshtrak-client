import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  language: string;
}

const initialState: LanguageState = {
  language: 'en'
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setCurrentLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
  }
});

export const { setCurrentLanguage } = languageSlice.actions;
export const selectLanguage = (state: { language: LanguageState }) => state.language.language;
export default languageSlice.reducer; 