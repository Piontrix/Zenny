import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";

// Utility to format time
const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ selectedChat }) => {
	const { socket } = useSocket();

	const [roomId, setRoomId] = useState("example-room-1"); // Replace later with dynamic
	const [user, setUser] = useState({ _id: "creator123", role: "creator", username: "CreatorX" });
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");

	const messagesEndRef = useRef(null);

	// Auto-scroll on new message
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Join room on mount
	useEffect(() => {
		if (socket && roomId && user) {
			socket.emit("joinRoom", {
				roomId,
				userId: user._id,
			});
		}
	}, [socket, roomId, user]);

	// Listen for incoming messages
	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (msg) => {
			setMessages((prev) => [...prev, msg]);

			// 🧠 Notify backend/sender it's seen
			if (socket) {
				socket.emit("messageSeen", {
					roomId: msg.roomId,
					messageId: msg._id, // if you plan to add MongoDB later
					sender: msg.sender,
					receiver: user._id,
				});
			}
		};

		socket.on("newMessage", handleNewMessage);

		return () => {
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket]);

	useEffect(() => {
		if (!socket) return;

		const handleMessageSeen = ({ messageId }) => {
			setMessages((prevMessages) => prevMessages.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg)));
		};

		socket.on("messageSeen", handleMessageSeen);

		return () => {
			socket.off("messageSeen", handleMessageSeen);
		};
	}, [socket]);

	// Send a message
	const handleSend = () => {
		if (socket && newMessage.trim()) {
			const messageObj = {
				roomId,
				message: newMessage,
				sender: user._id,
				sentAt: new Date(),
				seen: false,
			};

			socket.emit("sendMessage", messageObj);

			setMessages((prev) => [...prev, messageObj]);
			setNewMessage("");
		}
	};

	return (
		<div className="flex-1 flex flex-col justify-between p-4 bg-white shadow-sm">
			{/* Chat Messages */}
			<div className="flex-1 overflow-y-auto space-y-2 mb-4">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
							msg.sender === user._id
								? "bg-roseclub-light text-white self-end ml-auto"
								: "bg-gray-100 text-gray-800 self-start mr-auto"
						}`}
					>
						<p>{msg.message}</p>
						<p className="text-[10px] mt-1 text-right opacity-70">
							{formatTime(msg.sentAt || new Date())}
							{msg.sender === user._id && msg.seen && <span className="ml-1">✅</span>}
						</p>
					</div>
				))}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Field */}
			<div className="flex gap-2">
				<input
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					type="text"
					placeholder="Type a message..."
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-roseclub-accent"
				/>
				<button
					onClick={handleSend}
					className="bg-roseclub-accent text-white px-4 py-2 rounded-md hover:bg-roseclub-dark"
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatWindow;
