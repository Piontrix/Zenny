import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import { initiateChat } from "../controllers/chat.controller.js";
import { sendMessage } from "../controllers/chat.controller.js";
import { getMessagesByRoom } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/initiate", protect, allowRoles("creator"), initiateChat);
router.post("/message", protect, allowRoles("creator", "editor"), sendMessage);
router.get("/:roomId/messages", protect, allowRoles("creator", "editor"), getMessagesByRoom);

export default router;
