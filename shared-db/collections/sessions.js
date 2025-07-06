import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
	sessionId: {
		type: String,
		required: true,
		unique: true,
	},
	creatorId: {
		type: String,
		required: true,
	},
	editorId: {
		type: String,
		required: true,
	},
	adminId: {
		type: String,
		required: true,
	},
	chatGroupId: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ["active", "frozen", "ended", "completed"],
		default: "active",
	},
	projectDetails: {
		type: String,
		default: "",
	},
	sampleEditLink: {
		type: String,
		default: "",
	},
	paymentLink: {
		type: String,
		default: "",
	},
	finalVideoLink: {
		type: String,
		default: "",
	},
	paymentStatus: {
		type: String,
		enum: ["pending", "paid", "completed"],
		default: "pending",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	endedAt: {
		type: Date,
		default: null,
	},
});

export default mongoose.model("Session", sessionSchema);
