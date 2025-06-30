import { createOrGetSession } from "../services/createOrGetGroup.js";

export const handleInitCommand = async (ctx) => {
	const groupId = ctx.chat.id;

	// TEMP HARDCODED CREATOR / EDITOR IDs (simulate from DB in future)
	const creatorId = "creator123";
	const editorId = "editor456";

	await createOrGetSession(creatorId, editorId, groupId);

	await ctx.reply(`✅ Session initialized for creator ${creatorId} and editor ${editorId}`);
};
