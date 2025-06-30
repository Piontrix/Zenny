import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import editorReducer from "./slices/editorSlice";
import creatorReducer from "./slices/creatorSlice";
import paymentReducer from "./slices/paymentSlice";
import supportReducer from "./slices/supportSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		auth: authReducer,
		editors: editorReducer,
		creators: creatorReducer,
		payments: paymentReducer,
		support: supportReducer,
		ui: uiReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(apiSlice.middleware),
	devTools: import.meta.env.MODE !== "production",
});

export const RootState = store.getState;
export const AppDispatch = store.dispatch;
