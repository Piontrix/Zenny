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
      dbName: "zenny-prod",
    });
  }
  console.log("MONGO_URI:", process.env.MONGO_URI);
  while (true) {
    try {
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
        try {
          // Check if the message is still unread
          const message = await Message.findById(reminder.firstUnreadMessage);
          if (message && !message.read) {
            // Get recipient email
            const user = await User.findById(reminder.recipient);
            if (user && user.email) {
              try {
                await sendReminderEmail(user.email, reminder.chatRoom);
                console.log(`[Poller] Email sent successfully to ${user.email}`);
              } catch (emailError) {
                console.error(`[Poller] Failed to send email to ${user.email}:`, emailError.message);
                // Continue processing other reminders even if one email fails
                continue;
              }
            }
          }
          // Mark as sent
          reminder.sent = true;
          await reminder.save();
        } catch (reminderError) {
          console.error(`[Poller] Error processing reminder ${reminder._id}:`, reminderError.message);
          // Continue with next reminder
          continue;
        }
      }
    } catch (error) {
      console.error(`[Poller] Error in main loop:`, error.message);
    }
    // Wait 1 minute
    await new Promise((res) => setTimeout(res, 60 * 1000));
  }
}

// Add error handling for the main function
pollReminders().catch((error) => {
  console.error(`[Poller] Fatal error:`, error.message);
  // Exit gracefully instead of crashing
  process.exit(1);
});
