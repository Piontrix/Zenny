import { freezeSession } from "../redis/freezeManager.js";

export const handleFreezeCommand = async (ctx) => {
	const chatId = ctx.chat.id;
	await freezeSession(chatId);

	ctx.reply("🔒 Chat has been frozen by Admin.");
};
