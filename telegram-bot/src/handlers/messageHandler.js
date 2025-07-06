import mongoose from "mongoose";
import { BOT_COMMANDS, MESSAGES, USER_ROLES, SESSION_STATUS, PAYMENT_STATUS } from "../../../shared-utils/constants.js";
import {
	generateSessionId,
	getUserRole,
	isAdmin,
	isValidDriveLink,
	isValidPaymentLink,
	sanitizeMessage,
	containsPersonalInfo,
	getActiveSession,
	formatUserInfo,
} from "../../../shared-utils/telegramUtils.js";

// Import models
import Creator from "../../../shared-db/collections/creators.js";
import Editor from "../../../shared-db/collections/editors.js";
import Session from "../../../shared-db/collections/sessions.js";

export const setupMessageHandler = (bot) => {
	// Start command
	bot.start((ctx) => {
		ctx.reply(MESSAGES.WELCOME);
	});

	// Help command
	bot.command("help", (ctx) => {
		ctx.reply(MESSAGES.HELP_MESSAGE);
	});

	// Register as creator
	bot.command("register", async (ctx) => {
		try {
			const telegramId = ctx.from.id.toString();
			const username = ctx.from.username || "";
			const firstName = ctx.from.first_name || "";
			const lastName = ctx.from.last_name || "";

			// Check if already registered
			const existingCreator = await Creator.findOne({ telegramId });
			if (existingCreator) {
				ctx.reply("✅ You are already registered as a creator!");
				return;
			}

			// Check if user is editor
			const existingEditor = await Editor.findOne({ telegramId });
			if (existingEditor) {
				ctx.reply("❌ You are already registered as an editor. Cannot register as creator.");
				return;
			}

			// Create new creator
			const newCreator = new Creator({
				telegramId,
				username,
				firstName,
				lastName,
			});

			await newCreator.save();
			ctx.reply(MESSAGES.CREATOR_REGISTERED);
		} catch (error) {
			console.error("Error registering creator:", error);
			ctx.reply("❌ Error registering creator. Please try again.");
		}
	});

	// Login as editor
	bot.command("login", async (ctx) => {
		try {
			const telegramId = ctx.from.id.toString();
			const username = ctx.from.username || "";
			const firstName = ctx.from.first_name || "";
			const lastName = ctx.from.last_name || "";

			// Check if already logged in
			const existingEditor = await Editor.findOne({ telegramId });
			if (existingEditor) {
				ctx.reply("✅ You are already logged in as an editor!");
				return;
			}

			// For now, we'll use a simple password system
			// In production, this should be more secure
			const message = ctx.message.text;
			const password = message.split(" ")[1];

			if (!password) {
				ctx.reply("❌ Please provide password: /login <password>");
				return;
			}

			// Check if editor exists with this password
			const editor = await Editor.findOne({ password });
			if (!editor) {
				ctx.reply(MESSAGES.INVALID_PASSWORD);
				return;
			}

			// Update editor with Telegram info
			editor.telegramId = telegramId;
			editor.username = username;
			editor.firstName = firstName;
			editor.lastName = lastName;
			editor.isActive = true;
			editor.updatedAt = new Date();

			await editor.save();
			ctx.reply(MESSAGES.EDITOR_LOGIN_SUCCESS);
		} catch (error) {
			console.error("Error logging in editor:", error);
			ctx.reply("❌ Error logging in. Please try again.");
		}
	});

	// Start chat with editor
	bot.command("chat", async (ctx) => {
		try {
			const creatorId = ctx.from.id.toString();
			const message = ctx.message.text;
			const editorId = message.split(" ")[1];

			if (!editorId) {
				ctx.reply("❌ Please provide editor ID: /chat <editor_id>");
				return;
			}

			// Check if user is creator
			const creator = await Creator.findOne({ telegramId: creatorId });
			if (!creator || !creator.isActive) {
				ctx.reply("❌ You must be a registered creator to start a chat.");
				return;
			}

			// Check if editor exists
			const editor = await Editor.findOne({ telegramId: editorId });
			if (!editor || !editor.isActive) {
				ctx.reply("❌ Editor not found or inactive.");
				return;
			}

			// Check if creator already has active session
			const activeSession = await getActiveSession(creatorId, Session);
			if (activeSession) {
				ctx.reply("❌ You already have an active chat session. Please end it first.");
				return;
			}

			// For now, we'll create a session without a physical group chat
			// In production, you might want to create a supergroup and add participants
			const sessionId = generateSessionId();
			const adminId = "123456789"; // Replace with actual admin ID

			try {
				// Create session record
				const newSession = new Session({
					sessionId,
					creatorId,
					editorId,
					adminId,
					chatGroupId: `session_${sessionId}`, // Virtual chat ID for now
					status: SESSION_STATUS.ACTIVE,
				});

				await newSession.save();

				// Send notification to editor
				try {
					await bot.telegram.sendMessage(
						editorId,
						`🎬 New chat request from creator!\n\nSession ID: ${sessionId}\n\nYou can now communicate with the creator.`
					);
				} catch (error) {
					console.log("Could not send message to editor (they may not have started the bot)");
				}

				ctx.reply(
					`✅ Chat session started!\n\nSession ID: ${sessionId}\n\nYou can now communicate with the editor. Remember: No personal details allowed!`
				);
			} catch (error) {
				console.error("Error creating chat session:", error);
				ctx.reply("❌ Error creating chat session. Please try again.");
			}
		} catch (error) {
			console.error("Error starting chat:", error);
			ctx.reply("❌ Error starting chat. Please try again.");
		}
	});

	// Freeze chat (admin only)
	bot.command("freeze", async (ctx) => {
		try {
			const adminId = ctx.from.id.toString();

			if (!isAdmin(adminId)) {
				ctx.reply(MESSAGES.ADMIN_ONLY);
				return;
			}

			// Get session ID from message or use a parameter
			const message = ctx.message.text;
			const sessionId = message.split(" ")[1];

			if (!sessionId) {
				ctx.reply("❌ Please provide session ID: /freeze <session_id>");
				return;
			}

			const activeSession = await Session.findOne({
				sessionId: sessionId,
				status: { $in: ["active", "frozen"] },
			});

			if (!activeSession) {
				ctx.reply("❌ No active session found with this ID.");
				return;
			}

			activeSession.status = SESSION_STATUS.FROZEN;
			activeSession.updatedAt = new Date();
			await activeSession.save();

			// Notify participants
			try {
				await bot.telegram.sendMessage(activeSession.creatorId, "❄️ Your chat session has been frozen by admin.");
				await bot.telegram.sendMessage(activeSession.editorId, "❄️ Your chat session has been frozen by admin.");
			} catch (error) {
				console.log("Could not notify participants");
			}

			ctx.reply(MESSAGES.CHAT_FROZEN);
		} catch (error) {
			console.error("Error freezing chat:", error);
			ctx.reply("❌ Error freezing chat.");
		}
	});

	// End chat (admin only)
	bot.command("end", async (ctx) => {
		try {
			const adminId = ctx.from.id.toString();

			if (!isAdmin(adminId)) {
				ctx.reply(MESSAGES.ADMIN_ONLY);
				return;
			}

			// Get session ID from message or use a parameter
			const message = ctx.message.text;
			const sessionId = message.split(" ")[1];

			if (!sessionId) {
				ctx.reply("❌ Please provide session ID: /end <session_id>");
				return;
			}

			const activeSession = await Session.findOne({
				sessionId: sessionId,
				status: { $in: ["active", "frozen"] },
			});

			if (!activeSession) {
				ctx.reply("❌ No active session found with this ID.");
				return;
			}

			activeSession.status = SESSION_STATUS.ENDED;
			activeSession.endedAt = new Date();
			await activeSession.save();

			// Notify participants
			try {
				await bot.telegram.sendMessage(activeSession.creatorId, "🔚 Your chat session has been ended by admin.");
				await bot.telegram.sendMessage(activeSession.editorId, "🔚 Your chat session has been ended by admin.");
			} catch (error) {
				console.log("Could not notify participants");
			}

			ctx.reply(MESSAGES.CHAT_ENDED);
		} catch (error) {
			console.error("Error ending chat:", error);
			ctx.reply("❌ Error ending chat.");
		}
	});

	// Upload sample edit (editor only)
	bot.command("sample", async (ctx) => {
		try {
			const editorId = ctx.from.id.toString();
			const message = ctx.message.text;
			const link = message.split(" ")[1];

			if (!link) {
				ctx.reply("❌ Please provide drive link: /sample <drive_link>");
				return;
			}

			if (!isValidDriveLink(link)) {
				ctx.reply("❌ Please provide a valid Google Drive link.");
				return;
			}

			// Check if user is editor
			const editor = await Editor.findOne({ telegramId: editorId });
			if (!editor || !editor.isActive) {
				ctx.reply("❌ Only editors can upload sample edits.");
				return;
			}

			// Find active session
			const activeSession = await Session.findOne({
				editorId,
				status: { $in: ["active", "frozen"] },
			});

			if (!activeSession) {
				ctx.reply("❌ No active session found.");
				return;
			}

			activeSession.sampleEditLink = link;
			activeSession.updatedAt = new Date();
			await activeSession.save();

			ctx.reply(MESSAGES.SAMPLE_UPLOADED);
		} catch (error) {
			console.error("Error uploading sample:", error);
			ctx.reply("❌ Error uploading sample edit.");
		}
	});

	// Send payment link (editor only)
	bot.command("payment", async (ctx) => {
		try {
			const editorId = ctx.from.id.toString();
			const message = ctx.message.text;
			const link = message.split(" ")[1];

			if (!link) {
				ctx.reply("❌ Please provide payment link: /payment <payment_link>");
				return;
			}

			if (!isValidPaymentLink(link)) {
				ctx.reply("❌ Please provide a valid payment link.");
				return;
			}

			// Check if user is editor
			const editor = await Editor.findOne({ telegramId: editorId });
			if (!editor || !editor.isActive) {
				ctx.reply("❌ Only editors can send payment links.");
				return;
			}

			// Find active session
			const activeSession = await Session.findOne({
				editorId,
				status: { $in: ["active", "frozen"] },
			});

			if (!activeSession) {
				ctx.reply("❌ No active session found.");
				return;
			}

			activeSession.paymentLink = link;
			activeSession.updatedAt = new Date();
			await activeSession.save();

			ctx.reply(MESSAGES.PAYMENT_LINK_SENT);
		} catch (error) {
			console.error("Error sending payment link:", error);
			ctx.reply("❌ Error sending payment link.");
		}
	});

	// Send final video (editor only)
	bot.command("final", async (ctx) => {
		try {
			const editorId = ctx.from.id.toString();
			const message = ctx.message.text;
			const link = message.split(" ")[1];

			if (!link) {
				ctx.reply("❌ Please provide final video link: /final <video_link>");
				return;
			}

			if (!isValidDriveLink(link)) {
				ctx.reply("❌ Please provide a valid Google Drive link.");
				return;
			}

			// Check if user is editor
			const editor = await Editor.findOne({ telegramId: editorId });
			if (!editor || !editor.isActive) {
				ctx.reply("❌ Only editors can send final videos.");
				return;
			}

			// Find active session
			const activeSession = await Session.findOne({
				editorId,
				status: { $in: ["active", "frozen"] },
			});

			if (!activeSession) {
				ctx.reply("❌ No active session found.");
				return;
			}

			activeSession.finalVideoLink = link;
			activeSession.status = SESSION_STATUS.COMPLETED;
			activeSession.paymentStatus = PAYMENT_STATUS.COMPLETED;
			activeSession.updatedAt = new Date();
			await activeSession.save();

			ctx.reply(MESSAGES.FINAL_VIDEO_SENT);
		} catch (error) {
			console.error("Error sending final video:", error);
			ctx.reply("❌ Error sending final video.");
		}
	});

	// Handle regular messages
	bot.on("text", async (ctx) => {
		try {
			const userId = ctx.from.id.toString();
			const message = ctx.message.text;

			// Skip bot commands
			if (message.startsWith("/")) {
				return;
			}

			// Check if message contains personal info
			if (containsPersonalInfo(message)) {
				ctx.reply("⚠️ Please do not share personal information in this chat.");
				return;
			}

			// Sanitize message
			const sanitizedMessage = sanitizeMessage(message);

			// Get user role
			const userRole = await getUserRole(userId, Creator, Editor);
			if (!userRole) {
				ctx.reply("❌ You must register or login first.");
				return;
			}

			// Check if user has active session
			const activeSession = await getActiveSession(userId, Session);
			if (!activeSession) {
				ctx.reply("❌ You must be in an active chat session to send messages.");
				return;
			}

			// Check if session is frozen
			if (activeSession.status === SESSION_STATUS.FROZEN) {
				ctx.reply("❌ This chat has been frozen by admin.");
				return;
			}

			// Log message (for admin monitoring)
			console.log(`Message from ${userRole} ${userId}: ${sanitizedMessage}`);

			// Message is allowed to proceed
			// The actual message will be sent to the group chat automatically
		} catch (error) {
			console.error("Error handling message:", error);
			ctx.reply("❌ Error processing message.");
		}
	});

	// Handle errors
	bot.catch((err, ctx) => {
		console.error("Bot error:", err);
		ctx.reply("❌ An error occurred. Please try again.");
	});
};
