import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import foodActionsReducer from './slices/foodActionsSlice';
import uiReducer from './slices/uiSlice';
import apiReducer from './slices/apiSlice';
import userAdminReducer from './slices/userAdminSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    food: foodReducer,
    foodActions: foodActionsReducer,
    ui: uiReducer,
    api: apiReducer,
    userAdmin: userAdminReducer
});

export default rootReducer;
