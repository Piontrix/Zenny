import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
	{
		creatorId: {
			type: String,
			required: true,
		},
		editorId: {
			type: String,
			required: true,
		},
		groupId: {
			type: String,
			required: true, // Telegram group chat ID
			unique: true,
		},
		groupTitle: String,
		status: {
			type: String,
			enum: ["active", "frozen", "ended"],
			default: "active",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		endedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
