import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import {
	getAllChatRooms,
	freezeChatRoom,
	endChatRoom,
	unfreezeChatRoom,
	unendChatRoom,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/chat-rooms", getAllChatRooms);
router.patch("/chat/:roomId/freeze", freezeChatRoom);
router.patch("/chat/:roomId/end", endChatRoom);
router.patch("/chat/:roomId/unfreeze", unfreezeChatRoom);
router.patch("/chat/:roomId/unend", unendChatRoom);

export default router;
