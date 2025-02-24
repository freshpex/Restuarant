import { createSlice } from '@reduxjs/toolkit';

const apiSlice = createSlice({
  name: 'api',
  initialState: {
    requests: {},
    errors: {}
  },
  reducers: {
    startRequest: (state, action) => {
      state.requests[action.payload] = true;
    },
    endRequest: (state, action) => {
      state.requests[action.payload] = false;
    },
    setError: (state, action) => {
      const { endpoint, error } = action.payload;
      state.errors[endpoint] = error;
    },
    clearError: (state, action) => {
      delete state.errors[action.payload];
    }
  }
});

export const { startRequest, endRequest, setError, clearError } = apiSlice.actions;
export default apiSlice.reducer;
