import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order
 * @param {Object} orderData - Order data
 * @param {number} orderData.amount - Amount in paise
 * @param {string} orderData.currency - Currency code
 * @param {string} orderData.receipt - Receipt ID
 * @param {Object} orderData.notes - Additional notes
 * @returns {Promise<Object>} Razorpay order
 */
export const createRazorpayOrder = async (orderData) => {
	try {
		const order = await razorpay.orders.create({
			amount: orderData.amount,
			currency: orderData.currency,
			receipt: orderData.receipt,
			notes: orderData.notes,
		});

		return order;
	} catch (error) {
		console.error("Error creating Razorpay order:", error);
		throw new Error("Failed to create payment order");
	}
};

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Payment signature
 * @returns {Object} Verification result
 */
export const verifyPayment = async (orderId, paymentId, signature) => {
	try {
		// Create signature string
		const signatureString = `${orderId}|${paymentId}`;

		// Generate expected signature
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(signatureString)
			.digest("hex");

		// Compare signatures
		if (signature === expectedSignature) {
			// Verify payment with Razorpay API
			const payment = await razorpay.payments.fetch(paymentId);

			if (payment.status === "captured" && payment.order_id === orderId) {
				return {
					success: true,
					payment,
				};
			} else {
				return {
					success: false,
					error: "Payment not captured or order mismatch",
				};
			}
		} else {
			return {
				success: false,
				error: "Invalid signature",
			};
		}
	} catch (error) {
		console.error("Error verifying payment:", error);
		return {
			success: false,
			error: "Payment verification failed",
		};
	}
};

/**
 * Process refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise
 * @param {string} reason - Refund reason
 * @returns {Object} Refund result
 */
export const processRefund = async (paymentId, amount, reason) => {
	try {
		const refund = await razorpay.payments.refund(paymentId, {
			amount: amount * 100, // Convert to paise
			reason: reason,
		});

		return {
			success: true,
			refundId: refund.id,
			refund,
		};
	} catch (error) {
		console.error("Error processing refund:", error);
		return {
			success: false,
			error: "Refund processing failed",
		};
	}
};

/**
 * Get payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
	try {
		const payment = await razorpay.payments.fetch(paymentId);
		return {
			success: true,
			payment,
		};
	} catch (error) {
		console.error("Error fetching payment details:", error);
		return {
			success: false,
			error: "Failed to fetch payment details",
		};
	}
};

/**
 * Get refund details
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Refund details
 */
export const getRefundDetails = async (refundId) => {
	try {
		const refund = await razorpay.payments.fetchRefund(refundId);
		return {
			success: true,
			refund,
		};
	} catch (error) {
		console.error("Error fetching refund details:", error);
		return {
			success: false,
			error: "Failed to fetch refund details",
		};
	}
};

/**
 * Create payment link
 * @param {Object} linkData - Payment link data
 * @returns {Promise<Object>} Payment link
 */
export const createPaymentLink = async (linkData) => {
	try {
		const paymentLink = await razorpay.paymentLink.create({
			amount: linkData.amount * 100, // Convert to paise
			currency: linkData.currency || "INR",
			accept_partial: false,
			reference_id: linkData.referenceId,
			description: linkData.description,
			callback_url: linkData.callbackUrl,
			callback_method: "get",
		});

		return {
			success: true,
			paymentLink,
		};
	} catch (error) {
		console.error("Error creating payment link:", error);
		return {
			success: false,
			error: "Failed to create payment link",
		};
	}
};

export default {
	createRazorpayOrder,
	verifyPayment,
	processRefund,
	getPaymentDetails,
	getRefundDetails,
	createPaymentLink,
};
