// User Types
export const USER_TYPES = {
	ADMIN: "admin",
	CREATOR: "creator",
	EDITOR: "editor",
};

// Editor Status
export const EDITOR_STATUS = {
	ACTIVE: "active",
	INACTIVE: "inactive",
	SUSPENDED: "suspended",
};

// Project Status
export const PROJECT_STATUS = {
	PENDING: "pending",
	IN_PROGRESS: "in_progress",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
	DISPUTED: "disputed",
};

// Chat Status
export const CHAT_STATUS = {
	ACTIVE: "active",
	FROZEN: "frozen",
	ENDED: "ended",
};

// Payment Status
export const PAYMENT_STATUS = {
	PENDING: "pending",
	COMPLETED: "completed",
	FAILED: "failed",
	REFUNDED: "refunded",
};

// Service Types
export const SERVICE_TYPES = {
	VIDEO_EDITING: "video_editing",
	COLOR_GRADING: "color_grading",
	MOTION_GRAPHICS: "motion_graphics",
	AUDIO_EDITING: "audio_editing",
	SUBTITLES: "subtitles",
};

// Badge Types
export const BADGE_TYPES = {
	VERIFIED: "verified",
	PREMIUM: "premium",
	FAST_DELIVERY: "fast_delivery",
	QUALITY: "quality",
	POPULAR: "popular",
};

// Rate Limiting
export const RATE_LIMITS = {
	PORTFOLIO_VIEW: 100, // requests per hour
	API_CALLS: 1000, // requests per hour
	LOGIN_ATTEMPTS: 5, // attempts per 15 minutes
};

// File Upload Limits
export const UPLOAD_LIMITS = {
	MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
	ALLOWED_VIDEO_FORMATS: ["mp4", "mov", "avi", "mkv"],
	ALLOWED_IMAGE_FORMATS: ["jpg", "jpeg", "png", "webp"],
};

// Environment
export const ENV = {
	DEVELOPMENT: "development",
	PRODUCTION: "production",
	TEST: "test",
};

// API Response Codes
export const API_CODES = {
	SUCCESS: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INTERNAL_ERROR: 500,
};
