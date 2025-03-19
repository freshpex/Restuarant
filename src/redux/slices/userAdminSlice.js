import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchAllUsers = createAsyncThunk(
  "userAdmin/fetchAllUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to fetch users");
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "userAdmin/updateUserRole",
  async ({ email, role }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/admin/users/${email}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to update user role");
      }

      return { email, role };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const userAdminSlice = createSlice({
  name: "userAdmin",
  initialState: {
    users: [],
    loading: false,
    error: null,
    roleUpdateLoading: false,
    roleUpdateError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.roleUpdateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserRole.pending, (state) => {
        state.roleUpdateLoading = true;
        state.roleUpdateError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.roleUpdateLoading = false;

        const { email, role } = action.payload;
        state.users = state.users.map((user) =>
          user.email === email ? { ...user, role } : user,
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.roleUpdateLoading = false;
        state.roleUpdateError = action.payload;
      });
  },
});

export const { clearError } = userAdminSlice.actions;
export default userAdminSlice.reducer;
