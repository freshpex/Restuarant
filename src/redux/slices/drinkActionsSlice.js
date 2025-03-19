import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const addDrink = createAsyncThunk(
  "drinkActions/addDrink",
  async ({ drinkData, token, imageFile }, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/addDrink`;
      let response;

      if (imageFile) {
        const formData = new FormData();
        formData.append("drinkImage", imageFile);

        Object.keys(drinkData).forEach((key) => {
          formData.append(key, drinkData[key]);
        });

        response = await axios.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(url, drinkData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error adding drink:", error);
      console.error("Response:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.error || "Failed to add drink",
      );
    }
  },
);

export const updateDrink = createAsyncThunk(
  "drinkActions/updateDrink",
  async ({ id, drinkData, token, imageFile }, { rejectWithValue }) => {
    try {
      let response;

      if (imageFile) {
        const formData = new FormData();
        formData.append("drinkImage", imageFile);
        Object.keys(drinkData).forEach((key) => {
          formData.append(key, drinkData[key]);
        });

        response = await fetch(`${API_URL}/drink/update/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/drink/update/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(drinkData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || errorData.error || "Failed to update drink",
        );
      }

      const data = await response.json();
      return {
        id,
        ...drinkData,
        drinkImage: data.imageUrl || drinkData.drinkImage,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Error updating drink");
    }
  },
);

export const fetchUserDrinks = createAsyncThunk(
  "drinkActions/fetchUserdrink",
  async ({ email, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/drinks/user/${email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to fetch user drinks");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchTopDrinks = createAsyncThunk(
  "drinkActions/fetchTopDrinks",
  async (_, { rejectWithValue }) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(`${API_URL}/topSellingDrinks`);

        if (!response.ok) throw new Error("Failed to fetch top drinks");
        return await response.json();
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          return rejectWithValue(error.message);
        }
        await wait(RETRY_DELAY * retries);
      }
    }
  },
);

export const orderDrink = createAsyncThunk(
  "drinkActions/orderDrink",
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/purchaseDrink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...orderData,
          quantity: parseInt(orderData.quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const data = await response.json();

      try {
        await fetch(`${import.meta.env.VITE_API}/drinks/${orderData.drinkId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: -orderData.quantity,
          }),
        });
      } catch (quantityError) {
        console.error("Failed to update Drink quantity:", quantityError);
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "drinkActions/fetchOrders",
  async ({ email, token }, { rejectWithValue }) => {
    try {
      if (!email) {
        throw new Error("Email is required to fetch orders");
      }

      const response = await fetch(`${API_URL}/orders/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch orders");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "drinkActions/deleteOrder",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete order");
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTopDrinkById = createAsyncThunk(
  "drinkActions/fetchTopdrinkById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/topdrink/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch Drink");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchDrinkForUpdate = createAsyncThunk(
  "drinkActions/fetchdrinkForUpdate",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/drink/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.error || "Failed to fetch drink for update",
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch drink for update",
      );
    }
  },
);

export const updatePaymentStatus = createAsyncThunk(
  "drinkActions/updatePaymentStatus",
  async (
    { orderId, paymentStatus, transactionRef, token },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus,
          transactionRef,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to update payment status",
        );
      }

      return { orderId, paymentStatus, transactionRef };
    } catch (error) {
      return rejectWithValue(error.message || "Error updating payment status");
    }
  },
);

const drinkActionsSlice = createSlice({
  name: "drinkActions",
  initialState: {
    userDrinks: [],
    topDrinks: [],
    loading: false,
    error: null,
    success: false,
    orders: [],
    currentTopDrink: null,
    drinkForUpdate: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearDrinkForUpdate: (state) => {
      state.drinkForUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDrink.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDrink.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addDrink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDrink.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDrink.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateDrink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserDrinks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDrinks.fulfilled, (state, action) => {
        state.loading = false;
        state.userDrinks = action.payload;
      })
      .addCase(fetchUserDrinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTopDrinks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopDrinks.fulfilled, (state, action) => {
        state.loading = false;
        state.topDrinks = action.payload;
      })
      .addCase(fetchTopDrinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(orderDrink.pending, (state) => {
        state.loading = true;
      })
      .addCase(orderDrink.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(orderDrink.rejected, (state, action) => {
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
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload,
        );
      })
      .addCase(fetchTopDrinkById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopDrinkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopDrink = action.payload;
      })
      .addCase(fetchTopDrinkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDrinkForUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrinkForUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.drinkForUpdate = action.payload;
      })
      .addCase(fetchDrinkForUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.orders.length > 0) {
          state.orders = state.orders.map((order) =>
            order._id === action.payload.orderId
              ? { ...order, paymentStatus: action.payload.paymentStatus }
              : order,
          );
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearDrinkForUpdate } =
  drinkActionsSlice.actions;
export default drinkActionsSlice.reducer;
