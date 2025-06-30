import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { TELEGRAM_BOT_TOKEN } from "./config.js";
// import redisClient from "./redis/redisClient.js";
import connectMongo from "./db/mongo.js";
import { setupMessageHandler } from "./handlers/messageHandler.js";
dotenv.config();

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

await connectMongo();
// await redisClient.connect();

console.log("✅ Redis connected");
console.log("✅ Bot is setting up...");

setupMessageHandler(bot);

bot.launch().then(() => {
	console.log("✅ Telegram Bot is up and running 🚀");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
