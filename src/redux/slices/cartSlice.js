import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const loadCartFromStorage = () => {
  try {
    const cartItems = localStorage.getItem("cartItems");
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error("Failed to load cart from local storage:", error);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to local storage:", error);
  }
};

const calculateTotals = (items) => {
  return items
    .reduce((total, item) => {
      const price = item.foodPrice || item.drinkPrice || 0;
      return total + parseFloat(price) * item.quantity;
    }, 0)
    .toFixed(2);
};

const initialState = {
  items: loadCartFromStorage(),
  totalAmount: calculateTotals(loadCartFromStorage()),
  totalQuantity: loadCartFromStorage().reduce(
    (total, item) => total + item.quantity,
    0,
  ),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (cartItem) => cartItem._id === item._id,
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;

        const price = item.foodPrice || item.drinkPrice;
        state.items[existingItemIndex].totalPrice = (
          state.items[existingItemIndex].quantity * parseFloat(price)
        ).toFixed(2);
      } else {
        const isFood = item.hasOwnProperty("foodName");
        const isDrink = item.hasOwnProperty("drinkName");
        const itemType = isFood ? "food" : isDrink ? "drink" : "unknown";

        const price = item.foodPrice || item.drinkPrice;

        state.items.push({
          ...item,
          quantity,
          totalPrice: (quantity * parseFloat(price)).toFixed(2),
          itemType,
        });
      }

      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalAmount = calculateTotals(state.items);

      saveCartToStorage(state.items);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item._id === id);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;

        const price =
          state.items[itemIndex].foodPrice || state.items[itemIndex].drinkPrice;
        state.items[itemIndex].totalPrice = (
          quantity * parseFloat(price)
        ).toFixed(2);
      }

      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalAmount = calculateTotals(state.items);

      saveCartToStorage(state.items);
    },

    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalAmount = calculateTotals(state.items);

      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = "0.00";

      saveCartToStorage([]);
    },
  },
});

export const { addToCart, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;

export default cartSlice.reducer;
