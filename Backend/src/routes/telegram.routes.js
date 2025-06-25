// import express from "express";
// import { handleTelegramWebhook } from "../controllers/telegramController.js";

// const router = express.Router();

// // Telegram will send updates to this endpoint
// router.post(
// 	"/",
// 	(req, res, next) => {
// 		console.log("🧭 Route hit: /webhook/telegram");
// 		next();
// 	},
// 	handleTelegramWebhook
// );
// export default router;

import express from "express";
import { forwardToAdminGroup, handleStartCommand, handleReplyCommand } from "../services/telegram.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
	const body = req.body;
	console.log("🚀 Telegram Webhook hit!");
	console.log("📩 Body:", JSON.stringify(body, null, 2));

	const msg = body.message;
	if (!msg) return res.sendStatus(200);

	const chatId = msg.chat.id;
	const userId = msg.from.id;
	const text = msg.text || "";
	const senderName = msg.from.first_name;

	if (text.startsWith("/start")) {
		const editorId = text.split(" ")[1] || "Unnamed";
		await handleStartCommand(chatId, userId, editorId);
	} else if (text.startsWith("/reply")) {
		await handleReplyCommand(chatId, text);
	} else {
		await forwardToAdminGroup({ senderName, userId, message: text });
	}

	res.sendStatus(200);
});

export default router;
