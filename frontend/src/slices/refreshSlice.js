import { createSlice } from "@reduxjs/toolkit";

const refreshSlice = createSlice({
  name: "refresh",
  initialState: {
    refreshKey: 0,
  },
  reducers: {
    triggerRefresh: (state) => {
      state.refreshKey += 1;
    },
  },
});

export const { triggerRefresh } = refreshSlice.actions;
export default refreshSlice.reducer;
