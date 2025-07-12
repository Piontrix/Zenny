import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
	{
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		editor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isFrozen: {
			type: Boolean,
			default: false,
		},
		isEnded: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
