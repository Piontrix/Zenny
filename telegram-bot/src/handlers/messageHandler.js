import { handleFreezeCommand } from "../commands/freezeCommand.js";
import { handleEndChatCommand } from "../commands/endChatCommand.js";
import { handleIncomingMessage } from "../services/messageService.js";
import { handleInitCommand } from "../commands/initSessionCommand.js";

export const setupMessageHandler = (bot) => {
	bot.start((ctx) => {
		ctx.reply("Hello 👋 This is the Zenny Bot!");
	});
	bot.command("init", handleInitCommand);
	bot.command("freeze", (ctx) => handleFreezeCommand(ctx));
	bot.command("endchat", (ctx) => handleEndChatCommand(ctx));

	bot.on("text", async (ctx) => {
		await handleIncomingMessage(ctx);
	});
};
