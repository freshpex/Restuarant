import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import foodReducer from "./slices/foodSlice";
import foodActionsReducer from "./slices/foodActionsSlice";
import drinkReducer from "./slices/drinkSlice";
import drinkActionsReducer from "./slices/drinkActionsSlice";
import uiReducer from "./slices/uiSlice";
import cartReducer from "./slices/cartSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  food: foodReducer,
  drink: drinkReducer,
  foodActions: foodActionsReducer,
  drinkActions: drinkActionsReducer,
  ui: uiReducer,
  cart: cartReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "cart"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "auth/loginUser/fulfilled",
          "auth/registerUser/fulfilled",
          "auth/googleSignIn/fulfilled",
        ],
        ignoredPaths: ["auth.user"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
