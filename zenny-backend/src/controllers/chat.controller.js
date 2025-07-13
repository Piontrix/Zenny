import ChatRoom from "../models/ChatRoom.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";

export const initiateChat = async (req, res) => {
	try {
		const creatorId = req.user._id;
		const { editorId } = req.body;

		if (!editorId) {
			return res.status(400).json({ message: "Editor ID is required" });
		}

		// Check if editor exists
		const editor = await User.findOne({ _id: editorId, role: "editor" });
		if (!editor) {
			return res.status(404).json({ message: "Editor not found" });
		}

		// Check if chat already exists
		let chatRoom = await ChatRoom.findOne({ creator: creatorId, editor: editorId });

		if (chatRoom) {
			return res.status(200).json({
				message: "Chat already exists",
				roomId: chatRoom._id,
				isNew: false,
				editor: {
					username: editor.username,
					_id: editor._id,
				},
			});
		}

		// Create new chat room
		chatRoom = await ChatRoom.create({
			creator: creatorId,
			editor: editorId,
		});

		res.status(201).json({
			message: "Chat initiated",
			roomId: chatRoom._id,
			isNew: true,
			editor: {
				username: editor.username,
				_id: editor._id,
			},
		});
	} catch (err) {
		console.error("Chat initiation failed:", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { chatRoomId, content } = req.body;

		if (!chatRoomId || !content) {
			return res.status(400).json({ message: "ChatRoom ID and message content are required" });
		}

		const chatRoom = await ChatRoom.findById(chatRoomId);
		if (!chatRoom) {
			return res.status(404).json({ message: "Chat room not found" });
		}

		// Prevent sending messages if chat is frozen or ended
		if (chatRoom.isEnded) {
			return res.status(403).json({ message: "Chat has completed or ended by admin" });
		}
		if (chatRoom.isFrozen) {
			return res.status(403).json({ message: "Chat is frozen by admin" });
		}

		// Make sure sender is part of the chat
		if (
			chatRoom.creator.toString() !== req.user._id.toString() &&
			chatRoom.editor.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({ message: "You are not a participant of this chat" });
		}

		// Save the message
		const message = await Message.create({
			chatRoom: chatRoomId,
			sender: req.user._id,
			content,
		});

		res.status(201).json({
			message: "Message sent successfully",
			data: {
				_id: message._id,
				content: message.content,
				sender: message.sender,
				sentAt: message.sentAt,
				read: message.read,
			},
		});
	} catch (err) {
		console.error("Send message error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMessagesByRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		const chatRoom = await ChatRoom.findById(roomId);
		if (!chatRoom) {
			return res.status(404).json({ message: "Chat room not found" });
		}

		// Only creator or editor in the room can fetch messages
		if (
			chatRoom.creator.toString() !== req.user._id.toString() &&
			chatRoom.editor.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({ message: "Access denied to this chat" });
		}

		const messages = await Message.find({ chatRoom: roomId })
			.sort({ sentAt: 1 }) // oldest first
			.populate("sender", "username role");

		res.status(200).json({
			message: "Messages fetched successfully",
			data: messages,
		});
	} catch (err) {
		console.error("Get messages error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMyChatRooms = async (req, res) => {
	try {
		const userId = req.user._id;
		const userRole = req.user.role;

		let chatRooms;

		if (userRole === "creator") {
			chatRooms = await ChatRoom.find({ creator: userId }).populate("editor", "username email").sort({ updatedAt: -1 });
		} else if (userRole === "editor") {
			chatRooms = await ChatRoom.find({ editor: userId }).populate("creator", "username email").sort({ updatedAt: -1 });
		} else {
			return res.status(403).json({ message: "Invalid role" });
		}

		res.status(200).json({
			message: "Chat rooms fetched",
			data: chatRooms,
		});
	} catch (err) {
		console.error("Get my chat rooms error:", err);
		res.status(500).json({ message: "Server error" });
	}
};
