import express from "express";
import dotenv from "dotenv";
import bot from "./bot.js";
import startChatRoute from "./routes/startChatRoute.js";
import "./handlers/registerHandlers.js";
import { sendAdminControls } from "./handlers/adminActions.js";

dotenv.config();

const app = express();
app.use(express.json());

// API route from backend to start chat
app.use("/start-chat", startChatRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`🤖 Telegram bot server running on port ${PORT}`);
});
