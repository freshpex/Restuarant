// Auth selectors
export const selectCurrentUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;

// Food selectors
export const selectAllFoods = state => state.food.foods;
export const selectCurrentFood = state => state.food.currentFood;
export const selectUserFoods = state => state.foodActions.userFoods;
export const selectTopFoods = state => state.foodActions.topFoods;

// Loading selectors
export const selectIsLoading = state => state.ui.globalLoading;
export const selectApiLoading = (state, endpoint) => state.api.requests[endpoint];
