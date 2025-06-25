// controllers/telegramController.js
import { sendTelegramMessage, forwardToAdminGroup } from "../services/telegram.service.js";
import { welcomeMessage } from "../utils/messageTemplates.js";

// controllers/telegramController.js

export const handleTelegramWebhook = async (req, res) => {
	try {
		console.log("🚀 Telegram Webhook hit!");
		console.log("📩 Body:", JSON.stringify(req.body, null, 2));

		const message = req.body.message;
		if (!message || !message.text) return res.sendStatus(200);

		const { chat, from, text } = message;
		const chatId = chat.id;
		const userId = from.id;
		const senderName = from.first_name || "Anonymous";

		// Command: /start <editorId>
		if (text.startsWith("/start")) {
			const parts = text.split(" ");
			const editorName = parts[1] || "Unnamed";

			console.log(`🎯 /start command triggered. Editor ID: ${editorName}`);

			await sendTelegramMessage(
				chatId,
				`👋 Hello! You're now chatting anonymously with Editor <b>${editorName}</b>.\n\n${welcomeMessage}`
			);
			return res.sendStatus(200);
		}

		// Forward other messages
		await forwardToAdminGroup({ senderName, userId, text });

		res.sendStatus(200);
	} catch (err) {
		console.error("❌ Webhook Error:", err);
		res.sendStatus(500);
	}
};
