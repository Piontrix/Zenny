import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
	{
		sessionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Session",
			required: true,
		},
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Creator",
			required: true,
		},
		editorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Editor",
			required: true,
		},
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
		},
		raisedBy: {
			type: String,
			enum: ["creator", "editor", "admin"],
			required: true,
		},
		reason: {
			type: String,
			enum: [
				"quality_issue",
				"delivery_delay",
				"communication_issue",
				"payment_issue",
				"scope_creep",
				"cancellation",
				"other",
			],
			required: true,
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
		},
		status: {
			type: String,
			enum: ["open", "under_review", "resolved", "closed"],
			default: "open",
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "urgent"],
			default: "medium",
		},
		evidence: [
			{
				type: String, // URLs to evidence files
			},
		],
		resolution: {
			type: String,
			maxlength: 2000,
		},
		resolutionType: {
			type: String,
			enum: ["refund", "revision", "compensation", "warning", "suspension", "other"],
		},
		refundAmount: {
			type: Number,
			min: 0,
		},
		assignedTo: {
			type: String, // Admin username
		},
		adminNotes: {
			type: String,
			maxlength: 1000,
		},
		resolvedAt: {
			type: Date,
		},
		resolvedBy: {
			type: String, // Admin username
		},
		creatorSatisfied: {
			type: Boolean,
		},
		editorSatisfied: {
			type: Boolean,
		},
		escalated: {
			type: Boolean,
			default: false,
		},
		escalationReason: {
			type: String,
			maxlength: 500,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
disputeSchema.index({ sessionId: 1 });
disputeSchema.index({ creatorId: 1 });
disputeSchema.index({ editorId: 1 });
disputeSchema.index({ paymentId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ raisedBy: 1 });
disputeSchema.index({ assignedTo: 1 });
disputeSchema.index({ createdAt: -1 });

// Compound index for unique dispute per session
disputeSchema.index({ sessionId: 1, raisedBy: 1 }, { unique: true });

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
