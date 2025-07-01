import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    bookingInfo: null,
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },

    setBookingInfo: (state, action) => {
      state.bookingInfo = action.payload;
    },

    clearUser: (state) => {
      state.userInfo = null;
      state.bookingInfo = null;
    },
  },
});

export const { setUserInfo, setBookingInfo, clearUser } = userSlice.actions;
export default userSlice.reducer;
