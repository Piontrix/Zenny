import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
	user: user || null,
	token: token || null,
	isAuthenticated: !!token,
	isLoading: false,
	error: null,
	loginAttempts: 0,
	isLocked: false,
};

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
	try {
		const response = await axios.post(`${API_URL}/auth/login`, credentials);

		// Store in localStorage
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		return response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Login failed");
	}
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
	try {
		await axios.post(`${API_URL}/auth/logout`);

		// Clear localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		return null;
	} catch {
		// Even if logout API fails, clear local storage
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return rejectWithValue("Logout failed");
	}
});

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue, getState }) => {
	try {
		const { token } = getState().auth;

		if (!token) {
			throw new Error("No token available");
		}

		const response = await axios.get(`${API_URL}/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return response.data.user;
	} catch {
		// If token is invalid, clear auth state
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return rejectWithValue("Invalid token");
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		incrementLoginAttempts: (state) => {
			state.loginAttempts += 1;
			if (state.loginAttempts >= 5) {
				state.isLocked = true;
			}
		},
		resetLoginAttempts: (state) => {
			state.loginAttempts = 0;
			state.isLocked = false;
		},
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(login.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isAuthenticated = true;
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.loginAttempts = 0;
				state.isLocked = false;
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
				state.loginAttempts += 1;
				if (state.loginAttempts >= 5) {
					state.isLocked = true;
				}
			})
			// Logout
			.addCase(logout.fulfilled, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
				state.loginAttempts = 0;
				state.isLocked = false;
			})
			// Get current user
			.addCase(getCurrentUser.fulfilled, (state, action) => {
				state.user = action.payload;
				state.isAuthenticated = true;
			})
			.addCase(getCurrentUser.rejected, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
			});
	},
});

export const { clearError, incrementLoginAttempts, resetLoginAttempts } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsLocked = (state) => state.auth.isLocked;

export default authSlice.reducer;
