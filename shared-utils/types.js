// Type definitions for Telegram Bot

export const UserRole = {
	CREATOR: "creator",
	EDITOR: "editor",
	ADMIN: "admin",
};

export const SessionStatus = {
	ACTIVE: "active",
	FROZEN: "frozen",
	ENDED: "ended",
	COMPLETED: "completed",
};

export const PaymentStatus = {
	PENDING: "pending",
	PAID: "paid",
	COMPLETED: "completed",
};

// User types
export const Creator = {
	telegramId: String,
	username: String,
	firstName: String,
	lastName: String,
	isActive: Boolean,
	createdAt: Date,
	updatedAt: Date,
};

export const Editor = {
	telegramId: String,
	username: String,
	firstName: String,
	lastName: String,
	password: String,
	isActive: Boolean,
	createdAt: Date,
	updatedAt: Date,
};

export const Session = {
	sessionId: String,
	creatorId: String,
	editorId: String,
	adminId: String,
	chatGroupId: String,
	status: SessionStatus,
	projectDetails: String,
	sampleEditLink: String,
	paymentLink: String,
	finalVideoLink: String,
	paymentStatus: PaymentStatus,
	createdAt: Date,
	updatedAt: Date,
	endedAt: Date,
};
