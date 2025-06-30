import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
		},
		razorpayPaymentId: {
			type: String,
			unique: true,
			sparse: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 1, // Minimum 1 paise
		},
		currency: {
			type: String,
			default: "INR",
			enum: ["INR"],
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending",
		},
		serviceType: {
			type: String,
			enum: ["video_editing", "color_grading", "motion_graphics", "audio_editing", "subtitles"],
			required: true,
		},
		description: {
			type: String,
			maxlength: 500,
		},
		razorpayResponse: {
			type: Object, // Store full Razorpay response
		},
		refundAmount: {
			type: Number,
			default: 0,
		},
		refundReason: {
			type: String,
			maxlength: 500,
		},
		adminNotes: {
			type: String,
			maxlength: 1000,
		},
		completedAt: {
			type: Date,
		},
		refundedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ creatorId: 1 });
paymentSchema.index({ editorId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for amount in rupees
paymentSchema.virtual("amountInRupees").get(function () {
	return this.amount / 100;
});

// Virtual for refund amount in rupees
paymentSchema.virtual("refundAmountInRupees").get(function () {
	return this.refundAmount / 100;
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
