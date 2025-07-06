// Telegram Bot Constants
export const BOT_COMMANDS = {
	START: "/start",
	HELP: "/help",
	REGISTER: "/register",
	LOGIN: "/login",
	CHAT: "/chat",
	FREEZE: "/freeze",
	END: "/end",
	SAMPLE: "/sample",
	PAYMENT: "/payment",
	FINAL: "/final",
};

export const USER_ROLES = {
	CREATOR: "creator",
	EDITOR: "editor",
	ADMIN: "admin",
};

export const SESSION_STATUS = {
	ACTIVE: "active",
	FROZEN: "frozen",
	ENDED: "ended",
	COMPLETED: "completed",
};

export const PAYMENT_STATUS = {
	PENDING: "pending",
	PAID: "paid",
	COMPLETED: "completed",
};

export const MESSAGES = {
	WELCOME:
		"Welcome to Zenny Bot! 🚀\n\nI help connect creators and editors for anonymous collaboration.\n\nUse /register to join as a creator or /login if you're an editor.",
	CREATOR_REGISTERED: "✅ Creator registered successfully! You can now start chatting with editors.",
	EDITOR_LOGIN_SUCCESS: "✅ Editor login successful! You can now receive chat requests.",
	INVALID_PASSWORD: "❌ Invalid password. Please try again.",
	CHAT_STARTED:
		"🎬 Chat session started! You can now communicate anonymously.\n\nRemember: No personal details allowed!",
	CHAT_FROZEN: "❄️ Chat has been frozen by admin due to policy violation.",
	CHAT_ENDED: "🔚 Chat session ended.",
	SAMPLE_UPLOADED: "📁 Sample edit uploaded successfully!",
	PAYMENT_LINK_SENT: "💳 Payment link sent to creator.",
	FINAL_VIDEO_SENT: "🎬 Final video delivered! Session completed.",
	ADMIN_ONLY: "⚠️ This command is only available to admins.",
	INVALID_COMMAND: "❌ Invalid command. Use /help for available commands.",
	HELP_MESSAGE: `Available commands:
/start - Start the bot
/register - Register as a creator
/login <password> - Login as an editor
/chat <editor_id> - Start chat with editor
/freeze <session_id> - Freeze chat session (admin only)
/end <session_id> - End chat session (admin only)
/sample <link> - Upload sample edit (editor only)
/payment <link> - Send payment link (editor only)
/final <link> - Send final video (editor only)
/help - Show this help message`,
};

export const ADMIN_IDS = ["123456789"]; // Add actual admin Telegram IDs here
