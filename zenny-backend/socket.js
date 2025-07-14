import { Server } from "socket.io";

const socketUserMap = new Map();

export const setupSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
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

		socket.on("messageSeen", ({ roomId, messageId, sender, receiver }) => {
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
