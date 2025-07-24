import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
	{
		chatRoom: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ChatRoom",
			required: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		firstUnreadMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message",
			required: true,
		},
		scheduledFor: {
			type: Date,
			required: true,
		},
		sent: {
			type: Boolean,
			default: false,
		},
		cancelled: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
