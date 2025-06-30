import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
	creator: null,
	isLoading: false,
	error: null,
	isRegistered: false,
};

// Async thunks
export const registerCreator = createAsyncThunk("creators/register", async (creatorData, { rejectWithValue }) => {
	try {
		const response = await axios.post(`${API_URL}/creators`, creatorData);
		return response.data.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Registration failed");
	}
});

export const updateCreatorProfile = createAsyncThunk(
	"creators/updateProfile",
	async (profileData, { rejectWithValue, getState }) => {
		try {
			const { token } = getState().auth;
			const response = await axios.put(`${API_URL}/creators/profile`, profileData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Profile update failed");
		}
	}
);

export const fetchCreatorProfile = createAsyncThunk(
	"creators/fetchProfile",
	async (_, { rejectWithValue, getState }) => {
		try {
			const { token } = getState().auth;
			const response = await axios.get(`${API_URL}/creators/profile`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch profile");
		}
	}
);

const creatorSlice = createSlice({
	name: "creators",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setCreator: (state, action) => {
			state.creator = action.payload;
			state.isRegistered = !!action.payload;
		},
		clearCreator: (state) => {
			state.creator = null;
			state.isRegistered = false;
		},
	},
	extraReducers: (builder) => {
		builder
			// Register creator
			.addCase(registerCreator.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(registerCreator.fulfilled, (state, action) => {
				state.isLoading = false;
				state.creator = action.payload;
				state.isRegistered = true;
			})
			.addCase(registerCreator.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Update profile
			.addCase(updateCreatorProfile.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateCreatorProfile.fulfilled, (state, action) => {
				state.isLoading = false;
				state.creator = action.payload;
			})
			.addCase(updateCreatorProfile.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Fetch profile
			.addCase(fetchCreatorProfile.fulfilled, (state, action) => {
				state.creator = action.payload;
				state.isRegistered = true;
			});
	},
});

export const { clearError, setCreator, clearCreator } = creatorSlice.actions;

// Selectors
export const selectCreator = (state) => state.creators.creator;
export const selectCreatorLoading = (state) => state.creators.isLoading;
export const selectCreatorError = (state) => state.creators.error;
export const selectIsRegistered = (state) => state.creators.isRegistered;

export default creatorSlice.reducer;
