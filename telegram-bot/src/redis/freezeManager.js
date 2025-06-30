import redisClient from "./redisClient.js";

const FREEZE_KEY_PREFIX = "frozen:";

export const freezeSession = async (chatId) => {
	await redisClient.set(`${FREEZE_KEY_PREFIX}${chatId}`, "true", { EX: 86400 });
};

export const isSessionFrozen = async (chatId) => {
	const result = await redisClient.get(`${FREEZE_KEY_PREFIX}${chatId}`);
	return result === "true";
};
