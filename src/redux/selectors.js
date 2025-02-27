// Selectors for auth state
export const selectCurrentUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectToken = state => state.auth.token;
export const selectUserRole = state => state.auth.user?.role || 'member';
export const selectIsAdmin = state => state.auth.user?.role === 'admin';

// Selectors for food state
export const selectFoods = state => state.food.foods;
export const selectCurrentFood = state => state.food.currentFood;
export const selectFoodLoading = state => state.food.loading;
export const selectFoodError = state => state.food.error;

// Loading selectors
export const selectIsLoading = state => state.ui.globalLoading;
export const selectApiLoading = (state, endpoint) => state.api.requests[endpoint];
