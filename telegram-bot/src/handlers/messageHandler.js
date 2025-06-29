export const setupMessageHandler = (bot) => {
	bot.start((ctx) => {
		ctx.reply("Hello! This is the Zenny Bot Whatss👋");
	});

	bot.on("text", (ctx) => {
		const userId = ctx.from.id;
		const message = ctx.message.text;

		console.log(`Message from ${userId}: ${message}`);

		ctx.reply(`You said: ${message}`);
	});
};
