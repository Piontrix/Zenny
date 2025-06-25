// // services/telegram.service.js
// import axios from "axios";
// import { BOT_TOKEN, ADMIN_GROUP_ID } from "../config/config.js";

// const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// console.log(BOT_TOKEN, "ADKJASDBASKD");
// console.log(ADMIN_GROUP_ID, "ADKJASDBASKD");
// export const sendTelegramMessage = async (chatId, text) => {
// 	const data = { chat_id: chatId, text, parse_mode: "HTML" };
// 	console.log("📡 Requesting:", `${BASE_URL}/sendMessage`, data);

// 	try {
// 		const res = await axios.post(`${BASE_URL}/sendMessage`, data);
// 		console.log("✅ Telegram reply:", res.data);
// 	} catch (err) {
// 		console.error("❌ Telegram send error:", err.response?.data || err.message);
// 	}
// };

// export const forwardToAdminGroup = async ({ senderName, userId, text }) => {
// 	const msg = `📩 <b>Message from:</b> ${senderName} (${userId})\n📝 ${text}`;
// 	try {
// 		console.log(`📤 Forwarding message to admin group (${ADMIN_GROUP_ID}):`, msg);
// 		await axios.post(`${BASE_URL}/sendMessage`, {
// 			chat_id: ADMIN_GROUP_ID,
// 			text: msg,
// 			parse_mode: "HTML",
// 		});

// 		console.log("✅ Message forwarded to admin group.");
// 	} catch (err) {
// 		console.error("❌ Error forwarding to admin group:", err.message);
// 	}
// };

import axios from "axios";
import { ADMIN_GROUP_ID, BOT_TOKEN } from "../config/config.js";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Mapping between userId ↔ editorUsername
const userToEditorMap = new Map();

export const sendTelegramMessage = async (chatId, text, isHTML = true) => {
	try {
		const payload = {
			chat_id: chatId,
			text,
			...(isHTML ? { parse_mode: "HTML" } : {}),
		};
		await axios.post(`${BASE_URL}/sendMessage`, payload);
	} catch (err) {
		console.error("❌ Error sending message:", err.response?.data || err.message);
	}
};

export const forwardToAdminGroup = async ({ senderName, userId, message }) => {
	const text = `📩 <b>Message from:</b> ${senderName} (${userId})\n📝 ${message}`;
	await sendTelegramMessage(ADMIN_GROUP_ID, text);
};

export const handleStartCommand = async (chatId, userId, editorId = "Unnamed") => {
	userToEditorMap.set(userId, editorId); // Save mapping
	const msg = `👋 Hello! You're now chatting anonymously with Editor <b>${editorId}</b>.

🔐 <b>This chat is anonymous.</b>
🚫 Do NOT share phone numbers or social handles.

📝 Only discuss the work. Editor will send preview & payment link.`;
	await sendTelegramMessage(chatId, msg);
};

export const handleReplyCommand = async (editorChatId, text) => {
	// text: "/reply userId your message here"
	const parts = text.split(" ");
	if (parts.length < 3) return sendTelegramMessage(editorChatId, "⚠️ Usage: /reply <userId> <message>");

	const [, userId, ...messageParts] = parts;
	const message = messageParts.join(" ");

	await sendTelegramMessage(userId, `🛠 <b>Editor:</b> ${message}`);
};
