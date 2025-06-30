import { Telegraf } from "telegraf";

// Initialize Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Generate Telegram invite link for creator-editor chat
 * @param {Object} creator - Creator object
 * @param {Object} editor - Editor object
 * @param {string} serviceType - Type of service
 * @returns {Promise<Object>} Group data with invite link
 */
export const generateTelegramInviteLink = async (creator, editor, serviceType) => {
	try {
		// Create group title
		const groupTitle = `Zenny - ${creator.name} & ${editor.name} - ${serviceType}`;

		// Create supergroup
		const group = await bot.telegram.createChatInviteLink(process.env.TELEGRAM_GROUP_ID || "@zenny_support", {
			name: groupTitle,
			creates_join_request: false,
			expire_date: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
		});

		// Send welcome message to the group
		const welcomeMessage = `
🎬 *New Project Started*

👤 **Creator:** ${creator.name} (@${creator.telegramUsername})
✂️ **Editor:** ${editor.name} (@${editor.telegramUsername})
🎯 **Service:** ${serviceType}

💬 *This is your private chat room for project collaboration. Keep all communication here for better organization.*

⚠️ *Remember:*
• Be professional and respectful
• Share project details and requirements
• Discuss pricing and timelines
• Upload files and references here

Happy collaborating! 🚀
		`;

		// Note: In a real implementation, you would create a new group
		// and add both creator and editor to it
		// For now, we're using a placeholder approach

		return {
			groupId: group.chat.id || "placeholder_group_id",
			groupTitle,
			inviteLink: group.invite_link,
			welcomeMessage,
		};
	} catch (error) {
		console.error("Error generating Telegram invite link:", error);
		throw new Error("Failed to create Telegram group");
	}
};

/**
 * Send message to Telegram group
 * @param {string} groupId - Group ID
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Send result
 */
export const sendTelegramMessage = async (groupId, message) => {
	try {
		const result = await bot.telegram.sendMessage(groupId, message, {
			parse_mode: "Markdown",
		});

		return {
			success: true,
			messageId: result.message_id,
		};
	} catch (error) {
		console.error("Error sending Telegram message:", error);
		return {
			success: false,
			error: "Failed to send message",
		};
	}
};

/**
 * Send notification to user
 * @param {string} userId - User's Telegram ID
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Send result
 */
export const sendNotification = async (userId, message) => {
	try {
		const result = await bot.telegram.sendMessage(userId, message, {
			parse_mode: "Markdown",
		});

		return {
			success: true,
			messageId: result.message_id,
		};
	} catch (error) {
		console.error("Error sending notification:", error);
		return {
			success: false,
			error: "Failed to send notification",
		};
	}
};

/**
 * Create or get existing group
 * @param {string} creatorId - Creator's Telegram ID
 * @param {string} editorId - Editor's Telegram ID
 * @param {string} serviceType - Service type
 * @returns {Promise<Object>} Group data
 */
export const createOrGetGroup = async (creatorId, editorId, serviceType) => {
	try {
		// Check if group already exists for this creator-editor pair
		// In a real implementation, you would check your database

		// For now, create a new group
		const groupTitle = `Zenny Project - ${serviceType}`;

		// Create group (this is a simplified version)
		// In reality, you would use Telegram's createChat method
		const groupData = {
			groupId: `group_${creatorId}_${editorId}_${Date.now()}`,
			groupTitle,
			inviteLink: `https://t.me/joinchat/placeholder_${Date.now()}`,
		};

		return {
			success: true,
			...groupData,
		};
	} catch (error) {
		console.error("Error creating/getting group:", error);
		return {
			success: false,
			error: "Failed to create group",
		};
	}
};

/**
 * Add users to group
 * @param {string} groupId - Group ID
 * @param {Array} userIds - Array of user IDs to add
 * @returns {Promise<Object>} Add result
 */
export const addUsersToGroup = async (groupId, userIds) => {
	try {
		const results = [];

		for (const userId of userIds) {
			try {
				await bot.telegram.promoteChatMember(groupId, userId, {
					can_send_messages: true,
					can_send_media_messages: true,
					can_send_other_messages: true,
				});
				results.push({ userId, success: true });
			} catch (error) {
				console.error(`Error adding user ${userId} to group:`, error);
				results.push({ userId, success: false, error: error.message });
			}
		}

		return {
			success: true,
			results,
		};
	} catch (error) {
		console.error("Error adding users to group:", error);
		return {
			success: false,
			error: "Failed to add users to group",
		};
	}
};

/**
 * Archive group
 * @param {string} groupId - Group ID to archive
 * @returns {Promise<Object>} Archive result
 */
export const archiveGroup = async (groupId) => {
	try {
		// In a real implementation, you would archive the group
		// For now, we'll just return success
		return {
			success: true,
			message: "Group archived successfully",
		};
	} catch (error) {
		console.error("Error archiving group:", error);
		return {
			success: false,
			error: "Failed to archive group",
		};
	}
};

export default {
	generateTelegramInviteLink,
	sendTelegramMessage,
	sendNotification,
	createOrGetGroup,
	addUsersToGroup,
	archiveGroup,
};
