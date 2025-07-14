import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Format time nicely
const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ selectedChat }) => {
	const { socket } = useSocket();
	const { user, token } = useAuth();

	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const messagesEndRef = useRef(null);

	const roomId = selectedChat?._id;

	// Auto-scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Join room on room change
	useEffect(() => {
		if (socket && roomId && user?._id) {
			socket.emit("joinRoom", {
				roomId,
				userId: user._id,
			});
		}
	}, [socket, roomId, user]);

	// Fetch chat history
	useEffect(() => {
		const fetchMessages = async () => {
			if (!roomId || !token) return;
			try {
				const res = await axios.get(`http://localhost:4000/api/chat/${roomId}/messages`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setMessages(res.data.data || []);
			} catch (err) {
				console.error("❌ Error fetching messages:", err);
			}
		};
		fetchMessages();
	}, [roomId, token]);

	// Handle incoming message via socket
	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (msg) => {
			setMessages((prev) => [...prev, msg]);

			// Mark message as seen
			if (msg.sender._id !== user._id) {
				socket.emit("messageSeen", {
					roomId: msg.chatRoom,
					messageId: msg._id,
					sender: msg.sender._id,
					receiver: user._id,
				});
			}
		};

		socket.on("newMessage", handleNewMessage);

		return () => {
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket, user]);

	// Update message as seen
	useEffect(() => {
		if (!socket) return;

		const handleMessageSeen = ({ messageId }) => {
			setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg)));
		};

		socket.on("messageSeen", handleMessageSeen);

		return () => {
			socket.off("messageSeen", handleMessageSeen);
		};
	}, [socket]);

	// Send message
	const handleSend = async () => {
		if (!newMessage.trim()) return;

		try {
			const res = await axios.post(
				"http://localhost:4000/api/chat/message",
				{
					chatRoomId: roomId,
					content: newMessage,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const savedMessage = res.data.data;

			socket.emit("sendMessage", {
				...savedMessage,
				chatRoom: roomId,
				sender: { _id: user._id }, // attach minimal sender info
			});

			setMessages((prev) => [...prev, { ...savedMessage, sender: { _id: user._id } }]);
			setNewMessage("");
		} catch (err) {
			console.error("❌ Failed to send message:", err);
		}
	};

	if (!selectedChat) {
		return (
			<div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col justify-between p-4 bg-white shadow-sm">
			{/* Chat Body */}
			<div className="flex-1 overflow-y-auto space-y-2 mb-4">
				{messages.map((msg) => {
					const isSelf = msg.sender._id === user._id;
					return (
						<div
							key={msg._id}
							className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
								isSelf
									? "bg-roseclub-light text-white self-end ml-auto"
									: "bg-gray-100 text-gray-800 self-start mr-auto"
							}`}
						>
							<p>{msg.content}</p>
							<p className="text-[10px] mt-1 text-right opacity-70">
								{formatTime(msg.sentAt)}
								{isSelf && msg.read && <span className="ml-1">✅</span>}
							</p>
						</div>
					);
				})}
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
