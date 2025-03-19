import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDrinks = createAsyncThunk(
  "drink/fetchDrinks",
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/drinks?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch drinks");
      const data = await response.json();

      if (data && typeof data === "object" && Array.isArray(data.drinks)) {
        return {
          drinks: data.drinks,
          count: data.count || data.drinks.length,
          totalPages: data.totalPages || Math.ceil(data.count / size),
        };
      }

      return {
        drinks: Array.isArray(data) ? data : [],
        count: Array.isArray(data) ? data.length : 0,
        totalPages: Array.isArray(data) ? Math.ceil(data.length / size) : 0,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchDrinkById = createAsyncThunk(
  "drink/fetchDrinkById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/drinks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch drink");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const drinkSlice = createSlice({
  name: "drink",
  initialState: {
    drinks: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    currentDrink: null,
    pageSize: 9,
    count: 0,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentDrink: (state) => {
      state.currentDrink = null;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setCount: (state, action) => {
      state.count = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrinks.fulfilled, (state, action) => {
        state.loading = false;
        state.drinks = action.payload.drinks || [];
        state.count =
          action.payload.count || action.payload.drinks?.length || 0;
        state.totalPages = action.payload.totalPages || 0;
      })
      .addCase(fetchDrinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDrinkById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrinkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDrink = action.payload;
      })
      .addCase(fetchDrinkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  clearCurrentDrink,
  setTotalPages,
  setPageSize,
  setCount,
} = drinkSlice.actions;
export default drinkSlice.reducer;
