import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import { getAllChatRooms, freezeChatRoom, endChatRoom } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/chat-rooms", getAllChatRooms);
router.patch("/chat/:roomId/freeze", freezeChatRoom);
router.patch("/chat/:roomId/end", endChatRoom);

export default router;
