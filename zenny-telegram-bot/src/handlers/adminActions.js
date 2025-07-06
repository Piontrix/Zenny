import bot from "../bot.js";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_ID = parseInt(process.env.ADMIN_TELEGRAM_ID, 10);

// 👮 Send admin action buttons
export function sendAdminControls(chatId) {
	return bot.sendMessage(chatId, "🔐 *Admin Controls*", {
		parse_mode: "Markdown",
		reply_markup: {
			inline_keyboard: [
				[
					{ text: "❄️ Freeze Chat", callback_data: "freeze_chat" },
					{ text: "🚫 End Chat", callback_data: "end_chat" },
				],
			],
		},
	});
}

// 🎯 Handle button click
bot.on("callback_query", async (callbackQuery) => {
	const action = callbackQuery.data;
	const fromId = callbackQuery.from.id;
	const chatId = callbackQuery.message.chat.id;

	// Check if admin
	if (fromId !== ADMIN_ID) {
		return bot.answerCallbackQuery(callbackQuery.id, {
			text: "❌ You’re not authorized to perform this action.",
			show_alert: true,
		});
	}

	// Admin actions
	switch (action) {
		case "freeze_chat":
			await bot.sendMessage(chatId, "🛑 Chat has been *frozen* by Admin.", { parse_mode: "Markdown" });
			break;
		case "end_chat":
			await bot.sendMessage(chatId, "✅ Chat has been *ended* by Admin.", { parse_mode: "Markdown" });
			break;
		default:
			await bot.answerCallbackQuery(callbackQuery.id, { text: "Unknown action." });
	}

	// Acknowledge callback
	await bot.answerCallbackQuery(callbackQuery.id);
});
