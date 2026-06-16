import { createSlice } from '@reduxjs/toolkit';

export const searchAddressSlice = createSlice({
  name: 'addressSearch',
  initialState: {
    zipCode: null,
  },
  reducers: {
    setCurrentZip(state, action) {
      const { payload } = action;
      state.zipCode = payload;
    },
  },
});

export const { setCurrentZip } = searchAddressSlice.actions;
export const selectZip = (state) => state.addressSearch.zipCode;
export default searchAddressSlice.reducer;
