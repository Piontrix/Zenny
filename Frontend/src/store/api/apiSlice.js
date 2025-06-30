import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create base API slice
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
		prepareHeaders: (headers, { getState }) => {
			// Get token from auth state
			const token = getState().auth.token;

			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}

			headers.set("Content-Type", "application/json");
			return headers;
		},
		credentials: "include",
	}),
	tagTypes: ["Editor", "Creator", "Payment", "Support", "Session", "Feedback", "Dispute"],
	endpoints: () => ({}),
});

// Export hooks for usage in components
export const { usePrefetch } = apiSlice;
