import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import {
	getAllChatRooms,
	freezeChatRoom,
	endChatRoom,
	unfreezeChatRoom,
	unendChatRoom,
	getAllSupportTickets,
	updateSupportTicket,
} from "../controllers/admin.controller.js";
import { updateEditorPortfolioStructure, uploadEditorPortfolioSamples } from "../controllers/editor.controller.js";
import { uploadMedia } from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/chat-rooms", getAllChatRooms);
router.patch("/chat/:roomId/freeze", freezeChatRoom);
router.patch("/chat/:roomId/end", endChatRoom);
router.patch("/chat/:roomId/unfreeze", unfreezeChatRoom);
router.patch("/chat/:roomId/unend", unendChatRoom);

router.patch("/editors/:editorId/portfolio/structure", updateEditorPortfolioStructure);

			next();
// Portfolio sample media upload
router.patch("/editors/:editorId/portfolio/samples", uploadMedia.any(), uploadEditorPortfolioSamples);

router.get("/support-tickets", getAllSupportTickets);
router.patch("/support-tickets/:id", updateSupportTicket);

export default router;
