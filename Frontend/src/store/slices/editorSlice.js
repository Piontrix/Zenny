import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
	editors: [],
	currentEditor: null,
	isLoading: false,
	error: null,
	filters: {
		tags: [],
		services: [],
		minRating: 0,
		maxPrice: null,
		availability: null,
	},
	pagination: {
		page: 1,
		limit: 12,
		total: 0,
		totalPages: 0,
	},
	sortBy: "rating",
	sortOrder: "desc",
};

// Async thunks
export const fetchEditors = createAsyncThunk("editors/fetchEditors", async (params = {}, { rejectWithValue }) => {
	try {
		const queryParams = new URLSearchParams({
			page: params.page || 1,
			limit: params.limit || 12,
			sortBy: params.sortBy || "rating",
			sortOrder: params.sortOrder || "desc",
			...(params.tags && { tags: params.tags.join(",") }),
			...(params.services && { services: params.services.join(",") }),
			...(params.minRating && { minRating: params.minRating }),
			...(params.maxPrice && { maxPrice: params.maxPrice }),
			...(params.availability !== null && { availability: params.availability }),
		});

		const response = await axios.get(`${API_URL}/editors?${queryParams}`);
		return response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Failed to fetch editors");
	}
});

export const fetchEditorById = createAsyncThunk("editors/fetchEditorById", async (id, { rejectWithValue }) => {
	try {
		const response = await axios.get(`${API_URL}/editors/${id}`);
		return response.data.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.error || "Failed to fetch editor");
	}
});

export const fetchEditorPortfolio = createAsyncThunk(
	"editors/fetchEditorPortfolio",
	async (editorId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`${API_URL}/editors/${editorId}/portfolio`);
			return response.data.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || "Failed to fetch portfolio");
		}
	}
);

const editorSlice = createSlice({
	name: "editors",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setFilters: (state, action) => {
			state.filters = { ...state.filters, ...action.payload };
			state.pagination.page = 1; // Reset to first page when filters change
		},
		clearFilters: (state) => {
			state.filters = initialState.filters;
			state.pagination.page = 1;
		},
		setSort: (state, action) => {
			state.sortBy = action.payload.sortBy;
			state.sortOrder = action.payload.sortOrder;
			state.pagination.page = 1;
		},
		setPage: (state, action) => {
			state.pagination.page = action.payload;
		},
		clearCurrentEditor: (state) => {
			state.currentEditor = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch editors
			.addCase(fetchEditors.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchEditors.fulfilled, (state, action) => {
				state.isLoading = false;
				state.editors = action.payload.data;
				state.pagination = {
					page: action.payload.pagination?.page || 1,
					limit: action.payload.pagination?.limit || 12,
					total: action.payload.pagination?.total || 0,
					totalPages: action.payload.pagination?.totalPages || 0,
				};
			})
			.addCase(fetchEditors.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Fetch single editor
			.addCase(fetchEditorById.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchEditorById.fulfilled, (state, action) => {
				state.isLoading = false;
				state.currentEditor = action.payload;
			})
			.addCase(fetchEditorById.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Fetch portfolio
			.addCase(fetchEditorPortfolio.fulfilled, (state, action) => {
				if (state.currentEditor) {
					state.currentEditor.portfolio = action.payload;
				}
			});
	},
});

export const { clearError, setFilters, clearFilters, setSort, setPage, clearCurrentEditor } = editorSlice.actions;

// Selectors
export const selectEditors = (state) => state.editors.editors;
export const selectCurrentEditor = (state) => state.editors.currentEditor;
export const selectEditorsLoading = (state) => state.editors.isLoading;
export const selectEditorsError = (state) => state.editors.error;
export const selectEditorsFilters = (state) => state.editors.filters;
export const selectEditorsPagination = (state) => state.editors.pagination;
export const selectEditorsSort = (state) => ({
	sortBy: state.editors.sortBy,
	sortOrder: state.editors.sortOrder,
});

export default editorSlice.reducer;
