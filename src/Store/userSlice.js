import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
  },
  reducers: {
    setCurrentUser(state, action) {
      const { payload } = action;
      state.user = payload;
    },
  },
});

export const { setCurrentUser } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export default userSlice.reducer;
