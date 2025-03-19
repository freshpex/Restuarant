import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchFoods = createAsyncThunk(
  "food/fetchFoods",
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/foods?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch foods");
      const data = await response.json();

      if (data && typeof data === "object" && Array.isArray(data.foods)) {
        return {
          foods: data.foods,
          count: data.count || data.foods.length,
          totalPages: data.totalPages || Math.ceil(data.count / size),
        };
      }

      return {
        foods: Array.isArray(data) ? data : [],
        count: Array.isArray(data) ? data.length : 0,
        totalPages: Array.isArray(data) ? Math.ceil(data.length / size) : 0,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchFoodById = createAsyncThunk(
  "food/fetchFoodById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/foods/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch food");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const foodSlice = createSlice({
  name: "food",
  initialState: {
    foods: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    currentFood: null,
    pageSize: 9,
    count: 0,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentFood: (state) => {
      state.currentFood = null;
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
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload.foods || [];
        state.count = action.payload.count || action.payload.foods?.length || 0;
        state.totalPages = action.payload.totalPages || 0;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFoodById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFood = action.payload;
      })
      .addCase(fetchFoodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  clearCurrentFood,
  setTotalPages,
  setPageSize,
  setCount,
} = foodSlice.actions;
export default foodSlice.reducer;
