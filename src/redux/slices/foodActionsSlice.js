import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const addFood = createAsyncThunk(
  'foodActions/addFood',
  async (foodData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/addFood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(foodData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFood = createAsyncThunk(
  'foodActions/updateFood',
  async ({ id, foodData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(foodData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserFoods = createAsyncThunk(
  'foodActions/fetchUserFoods',
  async (email, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API}/foods/user/${email}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        throw new Error('Please log in again');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user foods');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchTopFoods = createAsyncThunk(
  'foodActions/fetchTopFoods',
  async (_, { rejectWithValue }) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API}/topSellingFoods`
        );

        if (!response.ok) throw new Error('Failed to fetch top foods');
        return await response.json();
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          return rejectWithValue(error.message);
        }
        await wait(RETRY_DELAY * retries);
      }
    }
  }
);

export const orderFood = createAsyncThunk(
  'foodActions/orderFood',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/purchaseFood`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify(orderData)
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'foodActions/fetchOrders',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/orders/user/${email}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'foodActions/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/orders/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to delete order');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopFoodById = createAsyncThunk(
  'foodActions/fetchTopFoodById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/topFood/${id}`);
      if (!response.ok) throw new Error('Failed to fetch top food');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const foodActionsSlice = createSlice({
  name: 'foodActions',
  initialState: {
    userFoods: [],
    topFoods: [],
    loading: false,
    error: null,
    success: false,
    orders: [],
    currentTopFood: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Food
      .addCase(addFood.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFood.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Food
      .addCase(updateFood.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFood.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Foods
      .addCase(fetchUserFoods.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.userFoods = action.payload;
      })
      .addCase(fetchUserFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Top Foods
      .addCase(fetchTopFoods.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.topFoods = action.payload;
      })
      .addCase(fetchTopFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Order Food
      .addCase(orderFood.pending, (state) => {
        state.loading = true;
      })
      .addCase(orderFood.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(orderFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order._id !== action.payload);
      })
      // Fetch Top Food By Id
      .addCase(fetchTopFoodById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopFoodById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopFood = action.payload;
      })
      .addCase(fetchTopFoodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = foodActionsSlice.actions;
export default foodActionsSlice.reducer;
