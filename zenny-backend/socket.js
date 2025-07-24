import { Server } from "socket.io";
import Message from "./src/models/Message.model.js";
import { cancelReminder } from "./src/controllers/chat.controller.js";
import ChatRoom from "./src/models/ChatRoom.model.js";
const socketUserMap = new Map();

let io;

export const setupSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL,
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.on("connection", (socket) => {
		console.log("📲 Socket connected:", socket.id);

		socket.on("joinRoom", ({ userId, roomId }) => {
			socket.join(roomId);
			socketUserMap.set(socket.id, { userId, roomId });
			console.log(`User ${userId} joined room ${roomId}`);
		});

		socket.on("sendMessage", (msg) => {
			const { chatRoom } = msg;
			io.to(chatRoom).emit("newMessage", msg);
		});

		socket.on("messageSeen", async ({ roomId, messageId, sender, receiver }) => {
			await Message.findByIdAndUpdate(messageId, { read: true });
			// Cancel reminder for this chat/recipient
			const chatRoom = await ChatRoom.findById(roomId);
			if (chatRoom) {
				await cancelReminder(roomId, receiver);
			}
			io.to(roomId).emit("messageSeen", { messageId, sender, receiver });
		});

		socket.on("typing", ({ roomId, user }) => {
			io.to(roomId).emit("typing", { user });
		});

		socket.on("stopTyping", ({ roomId, user }) => {
			io.to(roomId).emit("stopTyping", { user });
		});

		// 🔴 Freeze notification
		socket.on("freezeChatRoom", ({ roomId }) => {
			io.to(roomId).emit("chatFrozen");
		});

		// 🔴 End notification
		socket.on("endChatRoom", ({ roomId }) => {
			io.to(roomId).emit("chatEnded");
		});

		socket.on("disconnect", () => {
			const info = socketUserMap.get(socket.id);
			if (info) {
				console.log(`❌ User ${info.userId} disconnected from ${info.roomId}`);
				socketUserMap.delete(socket.id);
			}
		});
	});

	return io;
};

export const getIO = () => {
	if (!io) throw new Error("Socket.io not initialized");
	return io;
};
