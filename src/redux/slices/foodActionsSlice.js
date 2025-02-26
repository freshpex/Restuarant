import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add food action with file upload support
export const addFood = createAsyncThunk(
  'foodActions/addFood',
  async ({ foodData, token, imageFile }, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/addFood`;
      let response;

      if (imageFile) {
        // If we have a file, use FormData
        const formData = new FormData();
        formData.append('foodImage', imageFile);
        
        // Add all other food data fields
        Object.keys(foodData).forEach(key => {
          formData.append(key, foodData[key]);
        });
        
        response = await axios.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post(url, foodData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add food');
    }
  }
);

export const updateFood = createAsyncThunk(
  'foodActions/updateFood',
  async ({ id, foodData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  async ({ email, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/foods/user/${email}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        console.log('Auth error:', error);
        return rejectWithValue(error.message || 'Failed to fetch user foods');
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
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/purchaseFood`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            ...orderData,
            quantity: parseInt(orderData.quantity)
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      
      // Update food quantity after successful order
      try {
        await fetch(`${import.meta.env.VITE_API}/foods/${orderData.foodId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quantity: -orderData.quantity // Server will subtract this from current quantity
          })
        });
      } catch (quantityError) {
        console.error("Failed to update food quantity:", quantityError);
        // Continue even if this fails, as the order was successful
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'foodActions/fetchOrders',
  async ({ email, token }, { rejectWithValue }) => {
    try {
      if (!email) {
        throw new Error('Email is required to fetch orders');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API}/orders/user/${email}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'foodActions/deleteOrder',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/orders/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
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
      const response = await fetch(
        `${import.meta.env.VITE_API}/topFood/${id}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch food');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFoodForUpdate = createAsyncThunk(
  'foodActions/fetchFoodForUpdate',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/update/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch food');
      }
      
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
    foodForUpdate: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearFoodForUpdate: (state) => {
      state.foodForUpdate = null;
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
      })
      // Fetch Food For Update
      .addCase(fetchFoodForUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodForUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.foodForUpdate = action.payload;
      })
      .addCase(fetchFoodForUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearFoodForUpdate } = foodActionsSlice.actions;
export default foodActionsSlice.reducer;
