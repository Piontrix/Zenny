import express from "express";
import { body, validationResult } from "express-validator";
import Payment from "../../shared-db/collections/payments.js";
import Session from "../../shared-db/collections/sessionModel.js";
import Creator from "../../shared-db/collections/creators.js";
import Editor from "../../shared-db/collections/editors.js";
import { createRazorpayOrder, verifyPayment, processRefund } from "../services/razorpay/index.js";

const router = express.Router();

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Public
router.post(
	"/create-order",
	[
		body("sessionId").isMongoId().withMessage("Valid session ID is required"),
		body("amount").isNumeric().withMessage("Valid amount is required"),
		body("currency").optional().isIn(["INR", "USD"]).withMessage("Currency must be INR or USD"),
		body("serviceType").isString().withMessage("Service type is required"),
	],
	async (req, res) => {
		try {
			// Check validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					error: errors.array()[0].msg,
				});
			}

			const { sessionId, amount, currency = "INR", serviceType, notes } = req.body;

			// Find session and validate
			const session = await Session.findById(sessionId)
				.populate("creatorId", "name email telegramId")
				.populate("editorId", "name telegramId");

			if (!session) {
				return res.status(404).json({
					success: false,
					error: "Session not found",
				});
			}

			if (session.status !== "active") {
				return res.status(400).json({
					success: false,
					error: "Session is not active",
				});
			}

			// Create Razorpay order
			const orderData = {
				amount: amount * 100, // Convert to paise
				currency,
				receipt: `session_${sessionId}_${Date.now()}`,
				notes: {
					sessionId,
					creatorId: session.creatorId._id.toString(),
					editorId: session.editorId._id.toString(),
					serviceType,
					notes: notes || "",
				},
			};

			const razorpayOrder = await createRazorpayOrder(orderData);

			// Create payment record
			const payment = new Payment({
				sessionId: session._id,
				creatorId: session.creatorId._id,
				editorId: session.editorId._id,
				razorpayOrderId: razorpayOrder.id,
				amount: parseFloat(amount),
				currency,
				serviceType,
				status: "pending",
				notes,
			});

			await payment.save();

			res.status(201).json({
				success: true,
				data: {
					paymentId: payment._id,
					orderId: razorpayOrder.id,
					amount: razorpayOrder.amount,
					currency: razorpayOrder.currency,
					key: process.env.RAZORPAY_KEY_ID,
				},
				message: "Payment order created successfully",
			});
		} catch (error) {
			console.error("Error creating payment order:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create payment order",
			});
		}
	}
);

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Public
router.post(
	"/verify",
	[
		body("paymentId").isMongoId().withMessage("Valid payment ID is required"),
		body("razorpayPaymentId").isString().withMessage("Razorpay payment ID is required"),
		body("razorpaySignature").isString().withMessage("Razorpay signature is required"),
	],
	async (req, res) => {
		try {
			// Check validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					error: errors.array()[0].msg,
				});
			}

			const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

			// Find payment
			const payment = await Payment.findById(paymentId)
				.populate("sessionId")
				.populate("creatorId", "name telegramId")
				.populate("editorId", "name telegramId");

			if (!payment) {
				return res.status(404).json({
					success: false,
					error: "Payment not found",
				});
			}

			if (payment.status !== "pending") {
				return res.status(400).json({
					success: false,
					error: "Payment is not in pending status",
				});
			}

			// Verify payment with Razorpay
			const verificationResult = await verifyPayment(payment.razorpayOrderId, razorpayPaymentId, razorpaySignature);

			if (!verificationResult.success) {
				payment.status = "failed";
				payment.failureReason = verificationResult.error;
				await payment.save();

				return res.status(400).json({
					success: false,
					error: "Payment verification failed",
				});
			}

			// Update payment status
			payment.status = "completed";
			payment.razorpayPaymentId = razorpayPaymentId;
			payment.completedAt = new Date();
			await payment.save();

			// Update session status
			if (payment.sessionId) {
				payment.sessionId.status = "paid";
				await payment.sessionId.save();
			}

			// Update editor earnings
			const editor = await Editor.findById(payment.editorId);
			if (editor) {
				editor.completedProjects = (editor.completedProjects || 0) + 1;
				editor.totalEarnings = (editor.totalEarnings || 0) + payment.amount;
				await editor.save();
			}

			res.status(200).json({
				success: true,
				data: payment,
				message: "Payment verified successfully",
			});
		} catch (error) {
			console.error("Error verifying payment:", error);
			res.status(500).json({
				success: false,
				error: "Failed to verify payment",
			});
		}
	}
);

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
router.get("/:id", async (req, res) => {
	try {
		const payment = await Payment.findById(req.params.id)
			.populate("sessionId", "groupTitle status")
			.populate("creatorId", "name telegramUsername")
			.populate("editorId", "name telegramUsername");

		if (!payment) {
			return res.status(404).json({
				success: false,
				error: "Payment not found",
			});
		}

		res.status(200).json({
			success: true,
			data: payment,
		});
	} catch (error) {
		console.error("Error fetching payment:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch payment",
		});
	}
});

// @desc    Get payments by session
// @route   GET /api/payments/session/:sessionId
// @access  Private
router.get("/session/:sessionId", async (req, res) => {
	try {
		const payments = await Payment.find({ sessionId: req.params.sessionId })
			.populate("creatorId", "name telegramUsername")
			.populate("editorId", "name telegramUsername")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: payments,
		});
	} catch (error) {
		console.error("Error fetching session payments:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch session payments",
		});
	}
});

// @desc    Get payments by creator
// @route   GET /api/payments/creator/:creatorId
// @access  Private
router.get("/creator/:creatorId", async (req, res) => {
	try {
		const { page = 1, limit = 10, status } = req.query;

		// Build filter
		const filter = { creatorId: req.params.creatorId };
		if (status) filter.status = status;

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get payments
		const payments = await Payment.find(filter)
			.populate("sessionId", "groupTitle")
			.populate("editorId", "name telegramUsername")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count
		const total = await Payment.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: payments,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching creator payments:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch creator payments",
		});
	}
});

// @desc    Get payments by editor
// @route   GET /api/payments/editor/:editorId
// @access  Private
router.get("/editor/:editorId", async (req, res) => {
	try {
		const { page = 1, limit = 10, status } = req.query;

		// Build filter
		const filter = { editorId: req.params.editorId };
		if (status) filter.status = status;

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get payments
		const payments = await Payment.find(filter)
			.populate("sessionId", "groupTitle")
			.populate("creatorId", "name telegramUsername")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count
		const total = await Payment.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: payments,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching editor payments:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch editor payments",
		});
	}
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
router.post(
	"/:id/refund",
	[
		body("reason").isString().withMessage("Refund reason is required"),
		body("amount").optional().isNumeric().withMessage("Valid refund amount is required"),
	],
	async (req, res) => {
		try {
			// Check validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					error: errors.array()[0].msg,
				});
			}

			const { reason, amount } = req.body;

			// Find payment
			const payment = await Payment.findById(req.params.id);

			if (!payment) {
				return res.status(404).json({
					success: false,
					error: "Payment not found",
				});
			}

			if (payment.status !== "completed") {
				return res.status(400).json({
					success: false,
					error: "Payment is not completed",
				});
			}

			if (payment.status === "refunded") {
				return res.status(400).json({
					success: false,
					error: "Payment is already refunded",
				});
			}

			// Process refund with Razorpay
			const refundAmount = amount || payment.amount;
			const refundResult = await processRefund(payment.razorpayPaymentId, refundAmount, reason);

			if (!refundResult.success) {
				return res.status(400).json({
					success: false,
					error: "Refund processing failed",
				});
			}

			// Update payment status
			payment.status = "refunded";
			payment.refundId = refundResult.refundId;
			payment.refundAmount = refundAmount;
			payment.refundReason = reason;
			payment.refundedAt = new Date();
			await payment.save();

			res.status(200).json({
				success: true,
				data: payment,
				message: "Refund processed successfully",
			});
		} catch (error) {
			console.error("Error processing refund:", error);
			res.status(500).json({
				success: false,
				error: "Failed to process refund",
			});
		}
	}
);

// @desc    Get payment statistics
// @route   GET /api/payments/stats/overview
// @access  Private (Admin)
router.get("/stats/overview", async (req, res) => {
	try {
		const { startDate, endDate } = req.query;

		// Build date filter
		const dateFilter = {};
		if (startDate || endDate) {
			dateFilter.createdAt = {};
			if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
			if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
		}

		// Get statistics
		const totalPayments = await Payment.countDocuments({ ...dateFilter, status: "completed" });
		const totalAmount = await Payment.aggregate([
			{ $match: { ...dateFilter, status: "completed" } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]);

		const pendingPayments = await Payment.countDocuments({ ...dateFilter, status: "pending" });
		const failedPayments = await Payment.countDocuments({ ...dateFilter, status: "failed" });
		const refundedPayments = await Payment.countDocuments({ ...dateFilter, status: "refunded" });

		// Get recent payments
		const recentPayments = await Payment.find({ ...dateFilter })
			.populate("creatorId", "name")
			.populate("editorId", "name")
			.sort({ createdAt: -1 })
			.limit(10);

		res.status(200).json({
			success: true,
			data: {
				totalPayments,
				totalAmount: totalAmount[0]?.total || 0,
				pendingPayments,
				failedPayments,
				refundedPayments,
				recentPayments,
			},
		});
	} catch (error) {
		console.error("Error fetching payment statistics:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch payment statistics",
		});
	}
});

export default router;
