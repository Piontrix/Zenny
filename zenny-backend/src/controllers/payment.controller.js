import axios from "axios";
import User from "../models/User.model.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";

const { CASHFREE_API_URL, CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, CASHFREE_RETURN_URL, CASHFREE_WEBHOOK_SECRET } =
	process.env;

const getEditorTierPrice = (editor, planType) => {
	const tier = editor.portfolio?.tiers?.find((t) => t.title === planType);
	if (!tier || !tier.pricing?.length) return null;
	return tier.pricing[0].priceMin; // Assuming only 1 pricing object per tier
};

export const createPaymentLink = async (req, res) => {
	try {
		console.log("Creating payment link for:", { editorId: req.params.editorId, plan: req.params.plan });
		console.log("CashFree Environment Variables:", {
			CASHFREE_API_URL: CASHFREE_API_URL,
			CASHFREE_CLIENT_ID: CASHFREE_CLIENT_ID ? "SET" : "NOT SET",
			CASHFREE_CLIENT_SECRET: CASHFREE_CLIENT_SECRET ? "SET" : "NOT SET",
			CASHFREE_RETURN_URL: CASHFREE_RETURN_URL,
		});

		// Check if required environment variables are set
		if (!CASHFREE_API_URL || !CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
			console.error("Missing required CashFree environment variables");
			return res.status(500).json({
				message: "Payment gateway configuration error",
				error: "Missing required environment variables",
			});
		}
		const { editorId, plan } = req.params;
		const { creatorNote, phone } = req.body;

		if (!phone || phone.length !== 10) {
			return res.status(400).json({ message: "Phone number is required and must be 10 digits" });
		}

		const editor = await User.findById(editorId);
		if (!editor || editor.role !== "editor") {
			console.error("Editor not found:", { editorId, editor: editor?.role });
			return res.status(404).json({ message: "Editor not found" });
		}

		const amount = getEditorTierPrice(editor, plan);
		if (!amount) {
			console.error("No pricing found:", { editorId, plan, editorPortfolio: editor.portfolio });
			return res.status(400).json({ message: `No pricing found for ${plan} plan` });
		}

		console.log("Editor and amount validation passed:", { editorId, plan, amount });

		// Generate a unique orderId for this payment
		const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

		// Create order via Cashfree API
		const returnUrl = CASHFREE_RETURN_URL || "https://64499ebc9c09.ngrok-free.app/payment-success";

		const requestBody = {
			order_id: orderId,
			order_amount: amount,
			order_currency: "INR",
			customer_details: {
				customer_id: req.user._id.toString(),
				customer_email: req.user.email,
				customer_phone: phone,
			},
			order_meta: {
				return_url: `${returnUrl}?order_id=${orderId}`,
			},
			order_note: `Creator Note: ${creatorNote || ""} | Editor: ${editorId} | Plan: ${plan}`,
		};

		console.log("CashFree API URL:", `${CASHFREE_API_URL}/orders`);
		console.log("CashFree Request Body:", JSON.stringify(requestBody, null, 2));
		console.log("CashFree Headers:", {
			"Content-Type": "application/json",
			"x-client-id": CASHFREE_CLIENT_ID,
			"x-client-secret": "***HIDDEN***",
			"x-api-version": "2025-01-01",
		});

		// First create the order
		const orderResponse = await axios.post(`${CASHFREE_API_URL}/orders`, requestBody, {
			headers: {
				"Content-Type": "application/json",
				"x-client-id": CASHFREE_CLIENT_ID,
				"x-client-secret": CASHFREE_CLIENT_SECRET,
				"x-api-version": "2025-01-01",
			},
		});

		console.log("Order Response:", orderResponse.data);

		const cfOrderId = orderResponse.data.order_id;
		// const paymentLink = response.data.payments?.url;

		// Save to DB
		await Payment.create({
			editor: editorId,
			planType: plan,
			amount,
			cfOrderId: orderResponse.data.cf_order_id,
			orderId,
			status: "INITIATED",
			creatorNote,
			creator: req.user._id,
			phone,
		});
		console.log("CashFree API Response:", orderResponse.data);

		if (!orderResponse.data.payment_session_id) {
			console.error("No payment_session_id in response:", orderResponse.data);
			return res.status(500).json({ message: "Invalid response from payment gateway" });
		}

		const paymentSessionId = orderResponse.data.payment_session_id;
		console.log("Payment Session ID:", paymentSessionId);

		// Use the direct payment link approach (this was working before)
		// Clean the payment session ID - remove any extra characters
		const cleanPaymentSessionId = paymentSessionId?.replace(/paymentpayment$/, "");
		console.log("Clean Payment Session ID:", cleanPaymentSessionId);

		// Use the correct CashFree payment page URL
		const paymentLink = `https://sandbox.cashfree.com/pgapp/v1/orderpage?payment_session_id=${cleanPaymentSessionId}`;

		console.log("Generated payment link:", paymentLink);
		console.log("Payment link length:", paymentLink.length);
		res.status(201).json({
			paymentLink,
			paymentSessionId: paymentSessionId,
			raw: orderResponse.data,
		});
	} catch (error) {
		console.error("Cashfree Error Details:");
		console.error("Error message:", error.message);
		console.error("Error response:", error?.response?.data);
		console.error("Error status:", error?.response?.status);
		console.error("Error headers:", error?.response?.headers);
		console.error("Full error:", error);

		res.status(500).json({
			message: "Failed to create payment link",
			error: error?.response?.data || error.message,
		});
	}
};

export const handleCashfreeWebhook = async (req, res) => {
	try {
		console.log("---- Cashfree Webhook ----");

		const signature = req.headers["x-webhook-signature"];
		const timestamp = req.headers["x-webhook-timestamp"];
		const rawBody = req.rawBody;

		const merchantSecret = process.env.CASHFREE_WEBHOOK_SECRET;

		// Verify signature
		const expectedSignature = crypto
			.createHmac("sha256", merchantSecret)
			.update(timestamp + rawBody)
			.digest("base64");

		if (signature !== expectedSignature) {
			console.warn("Invalid signature");
			return res.status(401).json({ message: "Invalid webhook signature" });
		}

		const data = req.body.data || {};
		const cfOrderId = String(data.order?.order_id || "");
		const cfPaymentId = data.payment?.payment_id || null;
		const paymentStatus = data.payment?.payment_status;

		const statusMap = {
			SUCCESS: "SUCCESS",
			FAILED: "FAILED",
			INPROGRESS: "INITIATED",
		};

		const mappedStatus = statusMap[paymentStatus] || "FAILED";

		console.log(`Order: ${cfOrderId}, Payment: ${cfPaymentId}, Status: ${mappedStatus}`);

		await Payment.findOneAndUpdate(
			{ $or: [{ cfOrderId }, { orderId: cfOrderId }] },
			{ cfPaymentId, status: statusMap[paymentStatus] || "FAILED" }
		);

		if (!updated) {
			console.warn(`No DB record found for cfOrderId ${cfOrderId}`);
		} else {
			console.log("Updated payment:", updated.status);
		}

		res.status(200).json({ message: "Webhook received" });
	} catch (error) {
		console.error("Webhook error:", error);
		res.status(500).json({ message: "Webhook handling failed" });
	}
};

export const getEditorPayments = async (req, res) => {
	try {
		const payments = await Payment.find({ editor: req.user._id }).sort({ createdAt: -1 });
		res.json({ payments });
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch editor payments" });
	}
};

export const getAllPaymentsForAdmin = async (req, res) => {
	try {
		const payments = await Payment.find()
			.populate("editor", "username email")
			.populate("creator", "username email")
			.sort({ createdAt: -1 });

		res.json({ payments });
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch all payments" });
	}
};

export const getCreatorPayments = async (req, res) => {
	try {
		const payments = await Payment.find({ creator: req.user._id })
			.populate("editor", "username email")
			.sort({ createdAt: -1 });

		res.json({ payments });
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch creator payments" });
	}
};

export const getPaymentStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		console.log("Getting payment status for orderId:", orderId);

		const payment = await Payment.findOne({ orderId }).populate("editor", "username").populate("creator", "username");

		if (!payment) {
			console.log("Payment not found for orderId:", orderId);
			return res.status(404).json({ message: "Payment not found" });
		}

		console.log("Found payment:", payment);

		// Only allow access to the payment creator or editor
		if (
			payment.creator._id.toString() !== req.user._id.toString() &&
			payment.editor._id.toString() !== req.user._id.toString()
		) {
			console.log("Access denied for user:", req.user._id);
			return res.status(403).json({ message: "Access denied" });
		}

		res.json({ payment });
	} catch (error) {
		console.error("Error getting payment status:", error);
		res.status(500).json({ message: "Failed to fetch payment status" });
	}
};
