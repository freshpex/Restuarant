import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    globalLoading: true,
  },
  reducers: {
    startGlobalLoading: (state) => {
      state.globalLoading = true;
    },
    stopGlobalLoading: (state) => {
      state.globalLoading = false;
    },
  },
});

export const { startGlobalLoading, stopGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
