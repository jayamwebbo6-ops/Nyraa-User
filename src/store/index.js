import { configureStore, combineReducers } from "@reduxjs/toolkit";

import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import orderReducer from "./orderSlice";
import addressReducer from "./addressSlice";
import buyProductReducer from "./buyProductSlice";
import authReducer from "./authSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // ✅ defaults to localStorage

// 🔹 Persist config
const persistConfig = {
  key: "root",
  storage, // ✅ localStorage
  whitelist: ["auth", "buyProduct"],
};

// 🔹 Auth specific persist config (to avoid storing user data in localStorage)
const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["user", "isInitializing"], // ❌ Don't store sensitive user data or temp init state
};

// 🔹 Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer), // ✅ Apply nested persistence
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer,
  addresses: addressReducer,
  buyProduct: buyProductReducer,
});

// 🔹 Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🔹 Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

// 🔹 Persistor
export const persistor = persistStore(store);
