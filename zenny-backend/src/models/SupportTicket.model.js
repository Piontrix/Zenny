import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
	{
		name: { type: String },
		email: { type: String, required: true },
		subject: { type: String, required: true },
		message: { type: String, required: true },
		status: {
			type: String,
			enum: ["open", "in_progress", "resolved", "closed"],
			default: "open",
		},
		internalNote: { type: String },
	},
	{ timestamps: true }
);

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
