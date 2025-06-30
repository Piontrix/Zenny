import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
	tickets: [],
	currentTicket: null,
	isLoading: false,
	error: null,
	isSubmitted: false,
};

// Async thunks
export const submitSupportTicket = createAsyncThunk("support/submitTicket", async (ticketData, { rejectWithValue }) => {
	try {
		const response = await axios.post(`${API_URL}/support`, ticketData);
		return response.data.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Failed to submit support ticket");
	}
});

export const fetchSupportTickets = createAsyncThunk(
	"support/fetchTickets",
	async (params = {}, { rejectWithValue, getState }) => {
		try {
			const { token } = getState().auth;
			const queryParams = new URLSearchParams({
				page: params.page || 1,
				limit: params.limit || 10,
				...(params.status && { status: params.status }),
			});

			const response = await axios.get(`${API_URL}/support?${queryParams}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch support tickets");
		}
	}
);

export const fetchTicketById = createAsyncThunk(
	"support/fetchTicketById",
	async (ticketId, { rejectWithValue, getState }) => {
		try {
			const { token } = getState().auth;
			const response = await axios.get(`${API_URL}/support/${ticketId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch ticket details");
		}
	}
);

const supportSlice = createSlice({
	name: "support",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearSubmission: (state) => {
			state.isSubmitted = false;
		},
		setCurrentTicket: (state, action) => {
			state.currentTicket = action.payload;
		},
		clearCurrentTicket: (state) => {
			state.currentTicket = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Submit ticket
			.addCase(submitSupportTicket.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(submitSupportTicket.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSubmitted = true;
				state.currentTicket = action.payload;
				// Add to tickets list
				state.tickets.unshift(action.payload);
			})
			.addCase(submitSupportTicket.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Fetch tickets
			.addCase(fetchSupportTickets.fulfilled, (state, action) => {
				state.tickets = action.payload.tickets || [];
			})
			// Fetch single ticket
			.addCase(fetchTicketById.fulfilled, (state, action) => {
				state.currentTicket = action.payload;
			});
	},
});

export const { clearError, clearSubmission, setCurrentTicket, clearCurrentTicket } = supportSlice.actions;

// Selectors
export const selectSupportState = (state) => state.support;
export const selectSupportTickets = (state) => state.support.tickets;
export const selectCurrentTicket = (state) => state.support.currentTicket;
export const selectSupportLoading = (state) => state.support.isLoading;
export const selectSupportError = (state) => state.support.error;
export const selectIsSubmitted = (state) => state.support.isSubmitted;

export default supportSlice.reducer;
