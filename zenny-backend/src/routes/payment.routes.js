import express from "express";
import {
	createPaymentLink,
	handleCashfreeWebhook,
	getEditorPayments,
	getAllPaymentsForAdmin,
	getCreatorPayments,
	getPaymentStatus,
	createRefund,
	getRefundDetails,
} from "../controllers/payment.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Refund routes first so they aren't matched by /:editorId/:plan
router.post("/refund/:orderId", protect, allowRoles("admin"), createRefund);
router.get("/refund/:refundId", protect, allowRoles("editor", "creator", "admin"), getRefundDetails);

// ✅ Webhook
router.post("/webhook", handleCashfreeWebhook);

// ✅ Payments
router.post("/:editorId/:plan", protect, allowRoles("creator"), createPaymentLink);

router.get("/editor/me", protect, allowRoles("editor"), getEditorPayments);
router.get("/admin", protect, allowRoles("admin"), getAllPaymentsForAdmin);
router.get("/creator/me", protect, allowRoles("creator"), getCreatorPayments);
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
