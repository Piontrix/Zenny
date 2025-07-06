import mongoose from "mongoose";
import dotenv from "dotenv";
import { MONGO_URI } from "../config.js";
import Creator from "../../../shared-db/collections/creators.js";
import Editor from "../../../shared-db/collections/editors.js";
import Session from "../../../shared-db/collections/sessions.js";

dotenv.config();

const connectMongo = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");
	} catch (err) {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	}
};

const testDatabase = async () => {
	try {
		await connectMongo();

		console.log("\n🧪 Testing Database Connections...\n");

		// Test Creator model
		const creators = await Creator.find({});
		console.log(`📊 Found ${creators.length} creators in database`);

		// Test Editor model
		const editors = await Editor.find({});
		console.log(`📊 Found ${editors.length} editors in database`);

		// Test Session model
		const sessions = await Session.find({});
		console.log(`📊 Found ${sessions.length} sessions in database`);

		// Show test editors
		if (editors.length > 0) {
			console.log("\n📝 Test Editors:");
			editors.forEach((editor, index) => {
				console.log(`${index + 1}. ${editor.firstName} ${editor.lastName} - Password: ${editor.password}`);
			});
		}

		// Show active sessions
		const activeSessions = await Session.find({ status: { $in: ["active", "frozen"] } });
		if (activeSessions.length > 0) {
			console.log("\n🎬 Active Sessions:");
			activeSessions.forEach((session, index) => {
				console.log(`${index + 1}. Session ID: ${session.sessionId} - Status: ${session.status}`);
			});
		}

		console.log("\n✅ Database test completed successfully!");
		console.log("\n🚀 Bot is ready to use!");
		console.log("\n📋 Next steps:");
		console.log("1. Set up your Telegram bot token in .env file");
		console.log("2. Update admin IDs in shared-utils/constants.js");
		console.log("3. Run: npm run dev");
		console.log("4. Test with: /start, /register, /login editor123");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error testing database:", error);
		process.exit(1);
	}
};

testDatabase();
