import bot from "../bot.js";

// Hardcoded test logger (later this will be an API call to zenny-backend)
const logRegistration = (role, user) => {
	console.log(`[REGISTER ${role.toUpperCase()}]`);
	console.log(`ID: ${user.id}`);
	console.log(`Name: ${user.first_name} ${user.last_name || ""}`);
	console.log(`Username: @${user.username}`);
	console.log("--------------------------");
};

// /register - for Creators
bot.onText(/\/register/, async (msg) => {
	const user = msg.from;
	const chatId = msg.chat.id;

	logRegistration("creator", user);

	await bot.sendMessage(chatId, `✅ You’ve been registered as a Creator!\nYour masked ID will be shown to editors.`);
});

// /register_editor - for Editors
bot.onText(/\/register_editor/, async (msg) => {
	const user = msg.from;
	const chatId = msg.chat.id;

	logRegistration("editor", user);

	await bot.sendMessage(
		chatId,
		`🎬 You’ve been registered as an Editor!\nYour identity will remain anonymous to creators.`
	);
});
