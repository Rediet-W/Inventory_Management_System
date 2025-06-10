import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      if (action.payload?.success) {
        const userInfo = action.payload.data;
        if (userInfo && userInfo.token) {
          state.userInfo = userInfo;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
        } else {
          console.error("❌ Token missing in response:", action.payload);
        }
      } else {
        console.error("❌ Authentication failed:", action.payload.message);
      }
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
