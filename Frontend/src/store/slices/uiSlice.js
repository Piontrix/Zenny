import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	// Modal states
	modals: {
		loginModal: false,
		registerModal: false,
		paymentModal: false,
		supportModal: false,
		editorDetailsModal: false,
		confirmationModal: false,
	},
	// Notification states
	notifications: [],
	// Loading states
	loadingStates: {
		global: false,
		page: false,
	},
	// Theme and preferences
	theme: localStorage.getItem("theme") || "light",
	sidebarOpen: false,
	// Form states
	forms: {
		contactForm: {
			isSubmitting: false,
			isSubmitted: false,
		},
		editorRegistration: {
			isSubmitting: false,
			isSubmitted: false,
		},
	},
	// Pagination and filters
	pagination: {
		currentPage: 1,
		itemsPerPage: 12,
	},
	// Search and filters
	search: {
		query: "",
		filters: {},
	},
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		// Modal actions
		openModal: (state, action) => {
			const modalName = action.payload;
			if (Object.prototype.hasOwnProperty.call(state.modals, modalName)) {
				state.modals[modalName] = true;
			}
		},
		closeModal: (state, action) => {
			const modalName = action.payload;
			if (Object.prototype.hasOwnProperty.call(state.modals, modalName)) {
				state.modals[modalName] = false;
			}
		},
		closeAllModals: (state) => {
			Object.keys(state.modals).forEach((key) => {
				state.modals[key] = false;
			});
		},

		// Notification actions
		addNotification: (state, action) => {
			const notification = {
				id: Date.now(),
				timestamp: new Date().toISOString(),
				...action.payload,
			};
			state.notifications.push(notification);
		},
		removeNotification: (state, action) => {
			state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
		},
		clearNotifications: (state) => {
			state.notifications = [];
		},

		// Loading actions
		setGlobalLoading: (state, action) => {
			state.loadingStates.global = action.payload;
		},
		setPageLoading: (state, action) => {
			state.loadingStates.page = action.payload;
		},

		// Theme actions
		toggleTheme: (state) => {
			state.theme = state.theme === "light" ? "dark" : "light";
			localStorage.setItem("theme", state.theme);
		},
		setTheme: (state, action) => {
			state.theme = action.payload;
			localStorage.setItem("theme", state.theme);
		},

		// Sidebar actions
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action) => {
			state.sidebarOpen = action.payload;
		},

		// Form actions
		setFormSubmitting: (state, action) => {
			const { formName, isSubmitting } = action.payload;
			if (state.forms[formName]) {
				state.forms[formName].isSubmitting = isSubmitting;
			}
		},
		setFormSubmitted: (state, action) => {
			const { formName, isSubmitted } = action.payload;
			if (state.forms[formName]) {
				state.forms[formName].isSubmitted = isSubmitted;
			}
		},
		resetForm: (state, action) => {
			const formName = action.payload;
			if (state.forms[formName]) {
				state.forms[formName] = {
					isSubmitting: false,
					isSubmitted: false,
				};
			}
		},

		// Pagination actions
		setCurrentPage: (state, action) => {
			state.pagination.currentPage = action.payload;
		},
		setItemsPerPage: (state, action) => {
			state.pagination.itemsPerPage = action.payload;
			state.pagination.currentPage = 1; // Reset to first page
		},

		// Search and filter actions
		setSearchQuery: (state, action) => {
			state.search.query = action.payload;
		},
		setSearchFilters: (state, action) => {
			state.search.filters = { ...state.search.filters, ...action.payload };
		},
		clearSearch: (state) => {
			state.search.query = "";
			state.search.filters = {};
		},

		// Reset UI state
		resetUI: (state) => {
			return { ...initialState, theme: state.theme };
		},
	},
});

export const {
	openModal,
	closeModal,
	closeAllModals,
	addNotification,
	removeNotification,
	clearNotifications,
	setGlobalLoading,
	setPageLoading,
	toggleTheme,
	setTheme,
	toggleSidebar,
	setSidebarOpen,
	setFormSubmitting,
	setFormSubmitted,
	resetForm,
	setCurrentPage,
	setItemsPerPage,
	setSearchQuery,
	setSearchFilters,
	clearSearch,
	resetUI,
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectModals = (state) => state.ui.modals;
export const selectModalState = (modalName) => (state) => state.ui.modals[modalName];
export const selectNotifications = (state) => state.ui.notifications;
export const selectLoadingStates = (state) => state.ui.loadingStates;
export const selectGlobalLoading = (state) => state.ui.loadingStates.global;
export const selectPageLoading = (state) => state.ui.loadingStates.page;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectForms = (state) => state.ui.forms;
export const selectFormState = (formName) => (state) => state.ui.forms[formName];
export const selectPagination = (state) => state.ui.pagination;
export const selectSearch = (state) => state.ui.search;

export default uiSlice.reducer;
