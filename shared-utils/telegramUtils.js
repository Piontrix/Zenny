import { ADMIN_IDS, USER_ROLES } from "./constants.js";

// Generate unique session ID
export const generateSessionId = () => {
	return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Check if user is admin
export const isAdmin = (telegramId) => {
	return ADMIN_IDS.includes(telegramId.toString());
};

// Get user role based on database records
export const getUserRole = async (telegramId, Creator, Editor) => {
	try {
		const creator = await Creator.findOne({ telegramId: telegramId.toString() });
		if (creator && creator.isActive) {
			return USER_ROLES.CREATOR;
		}

		const editor = await Editor.findOne({ telegramId: telegramId.toString() });
		if (editor && editor.isActive) {
			return USER_ROLES.EDITOR;
		}

		if (isAdmin(telegramId)) {
			return USER_ROLES.ADMIN;
		}

		return null;
	} catch (error) {
		console.error("Error getting user role:", error);
		return null;
	}
};

// Validate drive link format
export const isValidDriveLink = (link) => {
	const drivePattern = /^https:\/\/drive\.google\.com\/.*$/;
	return drivePattern.test(link);
};

// Validate payment link format
export const isValidPaymentLink = (link) => {
	const paymentPattern = /^https:\/\/.*$/;
	return paymentPattern.test(link);
};

// Sanitize message to prevent personal info sharing
export const sanitizeMessage = (message) => {
	// Remove common personal identifiers
	const personalInfoPatterns = [
		/\b\d{10}\b/g, // Phone numbers
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
		/\b\d{3}-\d{2}-\d{4}\b/g, // SSN format
		/\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/g, // Credit card numbers
	];

	let sanitizedMessage = message;
	personalInfoPatterns.forEach((pattern) => {
		sanitizedMessage = sanitizedMessage.replace(pattern, "[REDACTED]");
	});

	return sanitizedMessage;
};

// Check if message contains personal information
export const containsPersonalInfo = (message) => {
	const personalInfoPatterns = [
		/\b\d{10}\b/, // Phone numbers
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
		/\b\d{3}-\d{2}-\d{4}\b/, // SSN format
		/\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/, // Credit card numbers
	];

	return personalInfoPatterns.some((pattern) => pattern.test(message));
};

// Get active session for user
export const getActiveSession = async (userId, Session) => {
	try {
		return await Session.findOne({
			$or: [{ creatorId: userId.toString() }, { editorId: userId.toString() }],
			status: { $in: ["active", "frozen"] },
		});
	} catch (error) {
		console.error("Error getting active session:", error);
		return null;
	}
};

// Format user info for display
export const formatUserInfo = (user, role) => {
	if (role === USER_ROLES.CREATOR) {
		return `👤 Creator: ${user.firstName} ${user.lastName}`;
	} else if (role === USER_ROLES.EDITOR) {
		return `✂️ Editor: ${user.firstName} ${user.lastName}`;
	}
	return `👤 User: ${user.firstName} ${user.lastName}`;
};
