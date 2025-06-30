export const handleEndChatCommand = async (ctx) => {
	const chatId = ctx.chat.id;

	ctx.reply("❌ Chat has been ended by Admin. No further messages allowed.");

	// Optional: you can call Redis or Mongo cleanup here too
};
