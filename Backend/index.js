// index.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { ADMIN_GROUP_ID, BOT_TOKEN, PORT } from "./src/config/config.js";

console.log("BOT_TOKEN:", BOT_TOKEN?.slice(0, 10));
console.log("ADMIN_GROUP_ID:", ADMIN_GROUP_ID);

connectDB().then(() => {
	app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
