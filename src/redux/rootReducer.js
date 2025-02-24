import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import foodActionsReducer from './slices/foodActionsSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    food: foodReducer,
    foodActions: foodActionsReducer,
    ui: uiReducer
});

export default rootReducer;
