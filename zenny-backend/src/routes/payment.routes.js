import express from "express";
import {
	createPaymentLink,
	handleCashfreeWebhook,
	getEditorPayments,
	getAllPaymentsForAdmin,
	getCreatorPayments,
	getPaymentStatus,
} from "../controllers/payment.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:editorId/:plan", protect, allowRoles("creator"), createPaymentLink);
router.post("/webhook", handleCashfreeWebhook);

router.get("/editor/me", protect, allowRoles("editor"), getEditorPayments);
router.get("/admin", protect, allowRoles("admin"), getAllPaymentsForAdmin);
router.get("/creator/me", protect, allowRoles("creator"), getCreatorPayments);
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
