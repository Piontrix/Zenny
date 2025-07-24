import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import { sendReminderEmail } from "./sendEmail.js";
import Reminder from "../models/Reminder.model.js";

dotenv.config();

async function pollReminders() {
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(process.env.MONGO_URI, {
			dbName: "zenny-db",
		});
	}
	console.log("MONGO_URI:", process.env.MONGO_URI);
	while (true) {
		const now = new Date();
		console.log(`[Poller] Now: ${now.toISOString()}`);
		// Find all reminders due, not sent, not cancelled
		const dueReminders = await Reminder.find({
			scheduledFor: { $lte: now },
			sent: false,
			cancelled: false,
		});
		console.log(`[Poller] Found ${dueReminders.length} due reminders`);
		for (const reminder of dueReminders) {
			// Check if the message is still unread
			const message = await Message.findById(reminder.firstUnreadMessage);
			if (message && !message.read) {
				// Get recipient email
				const user = await User.findById(reminder.recipient);
				if (user && user.email) {
					await sendReminderEmail(user.email, reminder.chatRoom);
				}
			}
			// Mark as sent
			reminder.sent = true;
			await reminder.save();
		}
		// Wait 1 minute
		await new Promise((res) => setTimeout(res, 60 * 1000));
	}
}

pollReminders();
