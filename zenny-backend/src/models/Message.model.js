import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		chatRoom: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ChatRoom",
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: { createdAt: "sentAt", updatedAt: false } }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
