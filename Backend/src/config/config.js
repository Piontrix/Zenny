import dotenv from "dotenv";
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 4000;
