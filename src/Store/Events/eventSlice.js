import { createSlice } from '@reduxjs/toolkit';

export const eventSlice = createSlice({
  name: 'event',
  initialState: {
    event: {},
  },
  reducers: {
    setCurrentEvent(state, action) {
      const { payload } = action;
      state.event = payload;
    },
  },
});

export const { setCurrentEvent } = eventSlice.actions;
export const selectEvent = (state) => state.event.event;
export default eventSlice.reducer;
