import express from "express";
import { createGroupWithUsers } from "../services/startChatService.js";

const router = express.Router();

router.post("/", async (req, res) => {
	const { creatorTelegramId, editorTelegramId, creatorName, editorName } = req.body;

	if (!creatorTelegramId || !editorTelegramId || !creatorName || !editorName) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		await createGroupWithUsers(creatorTelegramId, editorTelegramId, creatorName, editorName);
		return res.status(200).json({ message: "Group created successfully" });
	} catch (error) {
		console.error("Error creating group:", error);
		return res.status(500).json({ message: "Group creation failed" });
	}
});

export default router;
