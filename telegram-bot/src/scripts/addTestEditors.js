import mongoose from "mongoose";
import dotenv from "dotenv";
import { MONGO_URI } from "../config.js";
import Editor from "../../../shared-db/collections/editors.js";

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

const addTestEditors = async () => {
	try {
		await connectMongo();

		const testEditors = [
			{
				telegramId: "", // Will be set when they login
				username: "test_editor_1",
				firstName: "Test",
				lastName: "Editor 1",
				password: "editor123",
				isActive: true,
			},
			{
				telegramId: "", // Will be set when they login
				username: "test_editor_2",
				firstName: "Test",
				lastName: "Editor 2",
				password: "editor456",
				isActive: true,
			},
			{
				telegramId: "", // Will be set when they login
				username: "test_editor_3",
				firstName: "Test",
				lastName: "Editor 3",
				password: "editor789",
				isActive: true,
			},
		];

		for (const editorData of testEditors) {
			const existingEditor = await Editor.findOne({ password: editorData.password });
			if (!existingEditor) {
				const newEditor = new Editor(editorData);
				await newEditor.save();
				console.log(
					`✅ Added test editor: ${editorData.firstName} ${editorData.lastName} (Password: ${editorData.password})`
				);
			} else {
				console.log(`⚠️ Editor with password ${editorData.password} already exists`);
			}
		}

		console.log("\n🎬 Test editors added successfully!");
		console.log("\nTest Editor Credentials:");
		console.log("Editor 1 - Password: editor123");
		console.log("Editor 2 - Password: editor456");
		console.log("Editor 3 - Password: editor789");
		console.log("\nUse these passwords with /login command in Telegram bot");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error adding test editors:", error);
		process.exit(1);
	}
};

addTestEditors();
