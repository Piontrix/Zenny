import bot from "../bot.js";
import dotenv from "dotenv";
import { sendAdminControls } from "../handlers/adminActions.js";

dotenv.config();

const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID; // e.g., -1001959821291
const GROUP_INVITE_LINK = process.env.GROUP_INVITE_LINK; // e.g., https://t.me/+abcXYZ123

export async function createGroupWithUsers(creatorId, editorId, creatorName, editorName) {
	const groupTitle = `Zenny Chat: ${creatorName} × ${editorName}`;

	// Send invite link to creator
	await bot.sendMessage(
		creatorId,
		`👋 Hello ${creatorName}, click below to join your anonymous chat:\n${GROUP_INVITE_LINK}`
	);

	// Send invite link to editor
	await bot.sendMessage(
		editorId,
		`🎬 Hello ${editorName}, click below to join your anonymous chat:\n${GROUP_INVITE_LINK}`
	);

	// Send welcome + admin controls in the group
	await bot.sendMessage(
		GROUP_CHAT_ID,
		`🎉 New Chat Started!\n👤 Creator: ${creatorName}\n🎥 Editor: ${editorName}\n👮 Admin is monitoring.`
	);

	await sendAdminControls(GROUP_CHAT_ID);

	return true;
}
