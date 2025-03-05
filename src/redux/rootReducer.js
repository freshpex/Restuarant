import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import foodActionsReducer from './slices/foodActionsSlice';
import uiReducer from './slices/uiSlice';
import apiReducer from './slices/apiSlice';
import userAdminReducer from './slices/userAdminSlice';
import drinkReducer from './slices/drinkSlice';
import drinkActionsReducer from './slices/drinkActionsSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    food: foodReducer,
    foodActions: foodActionsReducer,
    drink: drinkReducer,
    drinkActions: drinkActionsReducer,
    ui: uiReducer,
    api: apiReducer,
    userAdmin: userAdminReducer
});

export default rootReducer;
