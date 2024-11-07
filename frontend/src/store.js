import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import refreshReducer from "./slices/refreshSlice"; // Import refreshReducer
import { apiSlice } from "./slices/apiSlice";
import { productApiSlice } from "./slices/productApiSlice";
import { requestedProductApiSlice } from "./slices/requestedProductApiSlice";
import { salesApiSlice } from "./slices/salesApiSlice";
import { summaryApiSlice } from "./slices/summaryApiSlice";
import { purchaseApiSlice } from "./slices/purchaseApiSlice";
import { shopApi } from "./slices/shopApiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    refresh: refreshReducer, // Add refresh reducer here
    [apiSlice.reducerPath]: apiSlice.reducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer,
    [requestedProductApiSlice.reducerPath]: requestedProductApiSlice.reducer,
    [salesApiSlice.reducerPath]: salesApiSlice.reducer,
    [summaryApiSlice.reducerPath]: summaryApiSlice.reducer,
    [purchaseApiSlice.reducerPath]: purchaseApiSlice.reducer,
    [shopApi.reducerPath]: shopApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      productApiSlice.middleware,
      requestedProductApiSlice.middleware,
      salesApiSlice.middleware,
      summaryApiSlice.middleware,
      purchaseApiSlice.middleware,
      shopApi.middleware
    ),
  devTools: true,
});

export default store;
