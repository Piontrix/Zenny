import ChatRoom from "../models/ChatRoom.model.js";
import User from "../models/User.model.js";

// GET all chat rooms with creator/editor info
export const getAllChatRooms = async (req, res) => {
	try {
		const rooms = await ChatRoom.find()
			.populate("creator", "username email")
			.populate("editor", "username email")
			.sort({ updatedAt: -1 });

		res.status(200).json({
			message: "Chat rooms fetched",
			data: rooms,
		});
	} catch (err) {
		console.error("Fetch chat rooms error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// PATCH freeze chat room
export const freezeChatRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		const chat = await ChatRoom.findByIdAndUpdate(roomId, { isFrozen: true }, { new: true });

		if (!chat) return res.status(404).json({ message: "Chat room not found" });

		res.status(200).json({ message: "Chat room frozen", data: chat });
	} catch (err) {
		console.error("Freeze chat error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// PATCH end chat room
export const endChatRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		const chat = await ChatRoom.findByIdAndUpdate(roomId, { isEnded: true }, { new: true });

		if (!chat) return res.status(404).json({ message: "Chat room not found" });

		res.status(200).json({ message: "Chat room ended", data: chat });
	} catch (err) {
		console.error("End chat error:", err);
		res.status(500).json({ message: "Server error" });
	}
};
