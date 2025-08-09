// src/constants/api.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const API = {
	BASE_URL,

	// Auth
	CREATOR_REGISTER: BASE_URL + "/api/auth/creator/register",
	CREATOR_LOGIN: BASE_URL + "/api/auth/creator/login",
	CREATOR_VERIFY_OTP: BASE_URL + "/api/auth/creator/verify",

	EDITOR_LOGIN: BASE_URL + "/api/auth/editor/login",
	ADMIN_LOGIN: BASE_URL + "/api/auth/admin/login",

	// Chat
	MY_CHAT_ROOMS: BASE_URL + "/api/chat/my-rooms",
	GET_MESSAGES: (roomId) => `${BASE_URL}/api/chat/${roomId}/messages`,
	SEND_MESSAGE: BASE_URL + "/api/chat/message",
	INITIATE_CHAT: BASE_URL + "/api/chat/initiate",

	// Admin Chat Control
	ADMIN_REGISTER_EDITOR: BASE_URL + "/api/auth/admin/register-editor",
	ADMIN_GET_CHAT_ROOMS: BASE_URL + "/api/admin/chat-rooms",
	ADMIN_FREEZE_CHAT: (roomId) => `${BASE_URL}/api/admin/chat/${roomId}/freeze`,
	ADMIN_UNFREEZE_CHAT: (roomId) => `${BASE_URL}/api/admin/chat/${roomId}/unfreeze`,
	ADMIN_END_CHAT: (roomId) => `${BASE_URL}/api/admin/chat/${roomId}/end`,
	ADMIN_UNEND_CHAT: (roomId) => `${BASE_URL}/api/admin/chat/${roomId}/unend`,
	ADMIN_GET_ALL_TICKETS: BASE_URL + "/api/admin/support-tickets",

	// Add this to the API object
	ADMIN_UPLOAD_EDITOR_PORTFOLIO_SAMPLES: (editorId) => `${BASE_URL}/api/admin/editors/${editorId}/portfolio/samples`,
	ADMIN_UPDATE_EDITOR_PORTFOLIO_STRUCTURE: (editorId) =>
		`${BASE_URL}/api/admin/editors/${editorId}/portfolio/structure`,

	ADMIN_GET_ALL_PAYMENTS: BASE_URL + "/api/payment/admin",

	// Users
	GET_ALL_EDITORS: BASE_URL + "/api/users/editors",
	GET_EDITOR_BY_ID: (editorId) => `${BASE_URL}/api/users/editors/${editorId}`,

	// Payment
	CREATE_PAYMENT_LINK: (editorId, plan) => `${BASE_URL}/api/payment/${editorId}/${plan}`,
	GET_CREATOR_PAYMENTS: BASE_URL + "/api/payment/creator/me",
	GET_EDITOR_PAYMENTS: BASE_URL + "/api/payment/editor/me",
	GET_PAYMENT_STATUS: (orderId) => `${BASE_URL}/api/payment/status/${orderId}`,

	SUBMIT_SUPPORT_TICKET: BASE_URL + "/api/public/support",
};

export default API;
