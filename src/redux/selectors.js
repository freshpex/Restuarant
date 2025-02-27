// Selectors for auth state
export const selectCurrentUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;
export const selectToken = state => state.auth.token;
export const selectUserRole = state => state.auth.user?.role || 'member';
export const selectIsAdmin = state => state.auth.user?.role === 'admin';

// Selectors for food state
export const selectFoods = state => state.food.foods;
export const selectCurrentFood = state => state.food.currentFood;
export const selectFoodLoading = state => state.food.loading;
export const selectFoodError = state => state.food.error;
export const selectAllFoods = state => state.food.foods;
export const selectUserFoods = state => state.foodActions.userFoods;
export const selectTopFoods = state => state.foodActions.topFoods;

// Loading selectors
export const selectIsLoading = state => state.ui.globalLoading;
export const selectApiLoading = (state, endpoint) => state.api.requests[endpoint];
