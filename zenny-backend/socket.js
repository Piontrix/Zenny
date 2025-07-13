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

		socket.on("sendMessage", ({ roomId, message, sender }) => {
			io.to(roomId).emit("newMessage", {
				roomId,
				message,
				sender,
				sentAt: new Date(),
			});
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
