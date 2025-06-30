export const generateInviteLinks = async (bot, groupId) => {
	const editorLink = await bot.telegram.createChatInviteLink(groupId, {
		name: "Editor Invite",
		expires_date: Math.floor(Date.now() / 1000) + 300,
		member_limit: 1,
	});

	const creatorLink = await bot.telegram.createChatInviteLink(groupId, {
		name: "Creator Invite",
		expires_date: Math.floor(Date.now() / 1000) + 300,
		member_limit: 1,
	});

	return { editorLink, creatorLink };
};
