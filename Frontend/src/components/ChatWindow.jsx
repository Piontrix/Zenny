import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ selectedChat }) => {
	const { socket } = useSocket();
	const { user, token } = useAuth();

	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	const roomId = selectedChat?._id;
	const isFrozen = selectedChat?.isFrozen;
	const isEnded = selectedChat?.isEnded;

	// Auto-scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Join room
	useEffect(() => {
		if (socket && roomId && user?._id) {
			socket.emit("joinRoom", {
				roomId,
				userId: user._id,
			});
		}
	}, [socket, roomId, user]);

	// Fetch message history
	useEffect(() => {
		const fetchMessages = async () => {
			if (!token || !roomId) return;

			try {
				const res = await axios.get(`http://localhost:4000/api/chat/${roomId}/messages`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setMessages(res.data.data || []);
			} catch (err) {
				console.error("❌ Error fetching messages", err);
			}
		};

		fetchMessages();
	}, [roomId, token]);

	// Listen for new messages
	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (msg) => {
			setMessages((prev) => [...prev, msg]);

			socket.emit("messageSeen", {
				roomId: msg.chatRoom,
				messageId: msg._id,
				sender: msg.sender._id,
				receiver: user._id,
			});
		};

		socket.on("newMessage", handleNewMessage);

		return () => {
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket, user, roomId]);

	// Listen for typing events
	useEffect(() => {
		if (!socket || !selectedChat) return;

		const handleTyping = ({ user: typingUser }) => {
			if (typingUser._id !== user._id && typingUser.role !== user.role) {
				setIsOtherUserTyping(true);
			}
		};

		const handleStopTyping = ({ user: typingUser }) => {
			if (typingUser._id !== user._id && typingUser.role !== user.role) {
				setIsOtherUserTyping(false);
			}
		};

		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);

		return () => {
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
		};
	}, [socket, user, selectedChat]);

	// Handle message seen updates
	useEffect(() => {
		if (!socket) return;

		const handleMessageSeen = ({ messageId }) => {
			setMessages((prevMessages) => prevMessages.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg)));
		};

		socket.on("messageSeen", handleMessageSeen);

		return () => {
			socket.off("messageSeen", handleMessageSeen);
		};
	}, [socket]);

	// Handle input change (typing logic)
	const handleInputChange = (e) => {
		setNewMessage(e.target.value);

		if (socket && roomId) {
			socket.emit("typing", {
				roomId,
				user: {
					_id: user._id,
					username: user.username,
					role: user.role,
				},
			});

			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			typingTimeoutRef.current = setTimeout(() => {
				socket.emit("stopTyping", {
					roomId,
					user: {
						_id: user._id,
						username: user.username,
						role: user.role,
					},
				});
			}, 2000);
		}
	};

	// Send a message
	const handleSend = async () => {
		if (!newMessage.trim() || !roomId || !token || isFrozen || isEnded) return;

		try {
			const res = await axios.post(
				"http://localhost:4000/api/chat/message",
				{ chatRoomId: roomId, content: newMessage },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			const savedMessage = res.data.data;

			socket.emit("sendMessage", {
				...savedMessage,
				chatRoom: roomId,
				sender: { _id: user._id },
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
			<div className="mb-4 flex items-center justify-between border-b pb-2">
				<div>
					<h2 className="font-semibold text-lg">
						{user.role === "creator" ? selectedChat.editor?.username : selectedChat.creator?.email}
					</h2>
					<p className="text-xs text-gray-500 capitalize">{user.role === "creator" ? "Editor" : "Creator"}</p>
				</div>
			</div>

			{/* Freeze / Ended Banner */}
			{isEnded && (
				<div className="text-sm text-white text-center bg-gray-800 py-1 rounded mb-2">
					This chat has been ended by an admin.
				</div>
			)}
			{isFrozen && !isEnded && (
				<div className="text-sm text-yellow-700 text-center bg-yellow-100 py-1 rounded mb-2">
					This chat is temporarily frozen by admin.
				</div>
			)}

			{/* Chat Messages */}
			<div className="flex-1 overflow-y-auto space-y-2 mb-4">
				{messages.map((msg, idx) => {
					const isSelf = msg.sender._id === user._id;
					return (
						<div
							key={msg._id || idx}
							className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
								isSelf
									? "bg-roseclub-light text-white self-end ml-auto"
									: "bg-gray-100 text-gray-800 self-start mr-auto"
							}`}
						>
							<p>{msg.content}</p>
							<p className="text-[10px] mt-1 text-right opacity-70">
								{formatTime(msg.sentAt || new Date())}
								{isSelf && msg.read && <span className="ml-1">✅</span>}
							</p>
						</div>
					);
				})}

				{/* Typing Indicator */}
				{isOtherUserTyping && (
					<div className="text-xs text-gray-500 italic ml-2">
						✍️ {user.role === "creator" ? "Editor" : "Creator"} is typing...
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Field */}
			<div className="flex gap-2">
				<input
					value={newMessage}
					onChange={handleInputChange}
					type="text"
					placeholder={isFrozen || isEnded ? "Chat is disabled" : "Type a message..."}
					disabled={isFrozen || isEnded}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-roseclub-accent disabled:bg-gray-100 disabled:text-gray-400"
				/>
				<button
					onClick={handleSend}
					disabled={isFrozen || isEnded}
					className={`px-4 py-2 rounded-md text-white ${
						isFrozen || isEnded ? "bg-gray-300 cursor-not-allowed" : "bg-roseclub-accent hover:bg-roseclub-dark"
					}`}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatWindow;
