import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  zipCode: string | null;
}

const initialState: SearchState = {
  zipCode: null,
};

export const searchAddressSlice = createSlice({
  name: 'addressSearch',
  initialState,
  reducers: {
    setCurrentZip(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.zipCode = payload;
    }
  }
});

export const { setCurrentZip } = searchAddressSlice.actions;
export const selectZip = (state: { addressSearch: SearchState }) => state.addressSearch.zipCode;
export default searchAddressSlice.reducer; 