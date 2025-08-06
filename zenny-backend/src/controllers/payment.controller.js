import axios from "axios";
import User from "../models/User.model.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";

const { CASHFREE_API_URL, CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET } = process.env;

const getEditorTierPrice = (editor, planType) => {
	const tier = editor.portfolio?.tiers?.find((t) => t.title === planType);
	if (!tier || !tier.pricing?.length) return null;
	return tier.pricing[0].priceMin; // Assuming only 1 pricing object per tier
};

export const createPaymentLink = async (req, res) => {
	try {
		const { editorId, plan } = req.params;
		const { creatorNote } = req.body;

		const editor = await User.findById(editorId);
		if (!editor || editor.role !== "editor") {
			return res.status(404).json({ message: "Editor not found" });
		}

		const amount = getEditorTierPrice(editor, plan);
		if (!amount) {
			return res.status(400).json({ message: `No pricing found for ${plan} plan` });
		}

		// Generate a unique orderId for this payment
		const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

		// Create order via Cashfree API
		const returnUrl = process.env.CASHFREE_RETURN_URL || "http://localhost:5173/payment-success";
		const response = await axios.post(
			`${CASHFREE_API_URL}/orders`,
			{
				order_id: orderId,
				order_amount: amount,
				order_currency: "INR",
				customer_details: {
					customer_id: req.user._id,
					customer_email: req.user.email,
				},

				order_meta: {
					return_url: `${returnUrl}?order_id=${orderId}`,
				},
				notes: {
					creatorNote: creatorNote || "",
					editorId: editorId,
					planType: plan,
				},
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-client-id": CASHFREE_CLIENT_ID,
					"x-client-secret": CASHFREE_CLIENT_SECRET,
					"x-api-version": "2022-09-01",
				},
			}
		);

		const cfOrderId = response.data.order_id;
		const paymentLink = response.data.payment_link;

		// Save to DB
		await Payment.create({
			editor: editorId,
			planType: plan,
			amount,
			cfOrderId,
			orderId,
			status: "INITIATED",
			creatorNote,
			creator: req.user._id,
		});

		res.status(201).json({ paymentLink });
	} catch (error) {
		console.error("Cashfree Error:", error?.response?.data || error.message);
		res.status(500).json({ message: "Failed to create payment link" });
	}
};

export const handleCashfreeWebhook = async (req, res) => {
	try {
		const signature = req.headers["x-webhook-signature"];
		const payload = JSON.stringify(req.body);

		const expectedSignature = crypto
			.createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
			.update(payload)
			.digest("base64");

		if (signature !== expectedSignature) {
			return res.status(401).json({ message: "Invalid webhook signature" });
		}

		const data = req.body.data;
		const cfOrderId = data.order?.order_id;
		const cfPaymentId = data.payment?.payment_id || null;
		const paymentStatus = data.payment?.payment_status;

		const statusMap = {
			SUCCESS: "SUCCESS",
			FAILED: "FAILED",
			INPROGRESS: "INITIATED",
		};

		await Payment.findOneAndUpdate({ cfOrderId }, { cfPaymentId, status: statusMap[paymentStatus] || "FAILED" });

		res.status(200).json({ message: "Webhook received" });
	} catch (error) {
		console.error("Webhook error:", error.message);
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
