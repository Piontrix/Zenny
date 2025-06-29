// src/config/config.js
import dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const MONGO_URI = process.env.MONGO_URI;
export const REDIS_URL = process.env.REDIS_URL;

if (!TELEGRAM_BOT_TOKEN || !MONGO_URI || !REDIS_URL) {
	console.error("❌ Missing one or more required environment variables.");
	process.exit(1);
}
