import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import {
	getAllChatRooms,
	freezeChatRoom,
	endChatRoom,
	unfreezeChatRoom,
	unendChatRoom,
} from "../controllers/admin.controller.js";
import multer from "multer";
import { updateEditorPortfolioStructure, uploadEditorPortfolioSamples } from "../controllers/editor.controller.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.use(protect, allowRoles("admin"));

router.get("/chat-rooms", getAllChatRooms);
router.patch("/chat/:roomId/freeze", freezeChatRoom);
router.patch("/chat/:roomId/end", endChatRoom);
router.patch("/chat/:roomId/unfreeze", unfreezeChatRoom);
router.patch("/chat/:roomId/unend", unendChatRoom);
router.patch("/editors/:editorId/portfolio/structure", updateEditorPortfolioStructure);

// Portfolio sample media upload (files + tags)
router.patch("/editors/:editorId/portfolio/samples", upload.any(), uploadEditorPortfolioSamples);

export default router;
