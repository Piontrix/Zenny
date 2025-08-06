import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		editor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		planType: {
			type: String,
			enum: ["basic", "intermediate", "pro"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		phone: {
			type: Number,
			required: true,
		},
		cfOrderId: {
			type: String,
			required: true,
		},
		orderId: {
			type: String,
			required: true,
		},
		cfPaymentId: {
			type: String,
		},
		status: {
			type: String,
			enum: ["INITIATED", "SUCCESS", "FAILED"],
			default: "INITIATED",
		},
		creatorNote: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
