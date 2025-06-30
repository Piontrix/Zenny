import { isSessionFrozen } from "../redis/freezeManager.js";

export const handleIncomingMessage = async (ctx) => {
	const chatId = ctx.chat.id;
	const senderId = ctx.from.id;
	const text = ctx.message.text;

	if (await isSessionFrozen(chatId)) {
		return ctx.reply("⚠️ This session is frozen.");
	}

	// Delete original message
	try {
		await ctx.deleteMessage();
	} catch (e) {
		console.error("❌ Failed to delete:", e.message);
	}

	// Placeholder: Masking IDs manually for now
	const isEditor = senderId.toString().endsWith("1"); // Replace with proper mapping later
	const alias = isEditor ? "Editor_001" : "Creator_027";

	// Re-send with alias
	await ctx.telegram.sendMessage(chatId, `${alias}: ${text}`);
};
