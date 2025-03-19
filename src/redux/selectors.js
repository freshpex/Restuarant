// Selectors for auth state
export const selectCurrentUser = (state) => state.auth?.user;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth?.isAuthenticated);
export const selectAuthLoading = (state) => state.auth?.loading || false;
export const selectAuthError = (state) => state.auth?.error || null;
export const selectToken = (state) => state.auth?.token;
export const selectUserRole = (state) => state.auth?.user?.role || "member";
export const selectIsAdmin = (state) => state.auth?.user?.role === "admin";

// Selectors for food state
export const selectFoods = (state) => state.food?.foods || [];
export const selectCurrentFood = (state) => state.food?.currentFood;
export const selectFoodLoading = (state) => state.food?.loading || false;
export const selectFoodError = (state) => state.food?.error || null;
export const selectAllFoods = (state) => state.food?.foods || [];
export const selectUserFoods = (state) => state.foodActions?.userFoods || [];
export const selectTopFoods = (state) => state.foodActions?.topFoods || [];

// Selectors for drink state
export const selectdrinks = (state) => state.food?.foods || [];
export const selectCurrentDrink = (state) => state.food?.currentFood;
export const selectDrinkLoading = (state) => state.food?.loading || false;
export const selectDrinkError = (state) => state.food?.error || null;
export const selectAllDrinks = (state) => state.food?.foods || [];
export const selectUserDrinks = (state) => state.foodActions?.userFoods || [];
export const selectTopDrinks = (state) => state.drinkActions?.topDrinks || [];

// Loading selectors
export const selectIsLoading = (state) => state.ui?.globalLoading || false;
export const selectApiLoading = (state, endpoint) =>
  state.api?.requests?.[endpoint] || false;

// Cart selectors
export const selectCartItems = (state) => state.cart?.items || [];
export const selectCartTotalAmount = (state) =>
  state.cart?.totalAmount || "0.00";
export const selectCartTotalQuantity = (state) =>
  state.cart?.totalQuantity || 0;
