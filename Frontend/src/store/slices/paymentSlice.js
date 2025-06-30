import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
	currentOrder: null,
	paymentStatus: "idle", // idle, pending, processing, completed, failed
	isLoading: false,
	error: null,
	paymentHistory: [],
	orderDetails: null,
};

// Async thunks
export const createPaymentOrder = createAsyncThunk("payments/createOrder", async (orderData, { rejectWithValue }) => {
	try {
		const response = await axios.post(`${API_URL}/payments/create-order`, orderData);
		return response.data.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Failed to create payment order");
	}
});

export const verifyPayment = createAsyncThunk("payments/verifyPayment", async (paymentData, { rejectWithValue }) => {
	try {
		const response = await axios.post(`${API_URL}/payments/verify`, paymentData);
		return response.data.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Payment verification failed");
	}
});

export const fetchPaymentHistory = createAsyncThunk(
	"payments/fetchHistory",
	async (params = {}, { rejectWithValue, getState }) => {
		try {
			const { token } = getState().auth;
			const queryParams = new URLSearchParams({
				page: params.page || 1,
				limit: params.limit || 10,
				...(params.status && { status: params.status }),
				...(params.startDate && { startDate: params.startDate }),
				...(params.endDate && { endDate: params.endDate }),
			});

			const response = await axios.get(`${API_URL}/payments/history?${queryParams}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch payment history");
		}
	}
);

export const fetchOrderDetails = createAsyncThunk(
	"payments/fetchOrderDetails",
	async (orderId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`${API_URL}/payments/order/${orderId}`);
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch order details");
		}
	}
);

const paymentSlice = createSlice({
	name: "payments",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setPaymentStatus: (state, action) => {
			state.paymentStatus = action.payload;
		},
		clearCurrentOrder: (state) => {
			state.currentOrder = null;
			state.paymentStatus = "idle";
		},
		resetPaymentState: (state) => {
			state.currentOrder = null;
			state.paymentStatus = "idle";
			state.isLoading = false;
			state.error = null;
			state.orderDetails = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Create payment order
			.addCase(createPaymentOrder.pending, (state) => {
				state.isLoading = true;
				state.error = null;
				state.paymentStatus = "pending";
			})
			.addCase(createPaymentOrder.fulfilled, (state, action) => {
				state.isLoading = false;
				state.currentOrder = action.payload;
				state.paymentStatus = "pending";
			})
			.addCase(createPaymentOrder.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
				state.paymentStatus = "failed";
			})
			// Verify payment
			.addCase(verifyPayment.pending, (state) => {
				state.isLoading = true;
				state.error = null;
				state.paymentStatus = "processing";
			})
			.addCase(verifyPayment.fulfilled, (state, action) => {
				state.isLoading = false;
				state.paymentStatus = "completed";
				state.orderDetails = action.payload;
				// Add to payment history
				if (action.payload) {
					state.paymentHistory.unshift(action.payload);
				}
			})
			.addCase(verifyPayment.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
				state.paymentStatus = "failed";
			})
			// Fetch payment history
			.addCase(fetchPaymentHistory.fulfilled, (state, action) => {
				state.paymentHistory = action.payload.payments || [];
			})
			// Fetch order details
			.addCase(fetchOrderDetails.fulfilled, (state, action) => {
				state.orderDetails = action.payload;
			});
	},
});

export const { clearError, setPaymentStatus, clearCurrentOrder, resetPaymentState } = paymentSlice.actions;

// Selectors
export const selectPaymentState = (state) => state.payments;
export const selectCurrentOrder = (state) => state.payments.currentOrder;
export const selectPaymentStatus = (state) => state.payments.paymentStatus;
export const selectPaymentLoading = (state) => state.payments.isLoading;
export const selectPaymentError = (state) => state.payments.error;
export const selectPaymentHistory = (state) => state.payments.paymentHistory;
export const selectOrderDetails = (state) => state.payments.orderDetails;

export default paymentSlice.reducer;
