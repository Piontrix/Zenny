import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API from "../../constants/api";

const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ selectedChat, setSelectedChat }) => {
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

	// Scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Join room
	useEffect(() => {
		if (socket && roomId && user?._id) {
			socket.emit("joinRoom", { roomId, userId: user._id });
		}
	}, [socket, roomId, user]);

	// Fetch messages
	useEffect(() => {
		if (!token || !roomId) return;
		const fetchMessages = async () => {
			try {
				const res = await axios.get(API.GET_MESSAGES(roomId), {
					headers: { Authorization: `Bearer ${token}` },
				});
				setMessages(res.data.data || []);
			} catch (err) {
				console.error("❌ Error fetching messages", err);
			}
		};
		fetchMessages();
	}, [roomId, token]);

	// Socket listeners
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

		const handleMessageSeen = ({ messageId }) => {
			setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg)));
		};

		socket.on("newMessage", handleNewMessage);
		socket.on("messageSeen", handleMessageSeen);

		return () => {
			socket.off("newMessage", handleNewMessage);
			socket.off("messageSeen", handleMessageSeen);
		};
	}, [socket, user, roomId]);

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

	// Admin control events
	useEffect(() => {
		if (!socket || !roomId) return;

		const updateChatStatus = (statusField, value) => {
			setSelectedChat((prev) => ({ ...prev, [statusField]: value }));
		};

		socket.on("chatFrozen", () => updateChatStatus("isFrozen", true));
		socket.on("chatEnded", () => updateChatStatus("isEnded", true));
		socket.on("chatUnfrozen", () => updateChatStatus("isFrozen", false));
		socket.on("chatReopened", () => updateChatStatus("isEnded", false));

		return () => {
			socket.off("chatFrozen");
			socket.off("chatEnded");
			socket.off("chatUnfrozen");
			socket.off("chatReopened");
		};
	}, [socket, roomId, setSelectedChat]);

	// Typing
	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		if (socket && roomId) {
			socket.emit("typing", { roomId, user });
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = setTimeout(() => {
				socket.emit("stopTyping", { roomId, user });
			}, 2000);
		}
	};

	// Send
	const handleSend = async () => {
		if (!newMessage.trim() || !roomId || !token || isFrozen || isEnded) return;
		try {
			const res = await axios.post(
				API.SEND_MESSAGE,
				{ chatRoomId: roomId, content: newMessage },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
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
		<div className="flex-1 flex flex-col justify-between p-3 md:p-4 bg-white shadow-sm h-full">
			{/* Header */}
			<div className="mb-2 border-b pb-1">
				<h2 className="font-semibold text-lg">
					{user.role === "creator" ? selectedChat.editor?.username : selectedChat.creator?.email}
				</h2>
				<p className="text-xs text-gray-500">{user.role === "creator" ? "Editor" : "Creator"}</p>
			</div>

			{/* Status Banner */}
			{isEnded && (
				<p className="text-xs text-white bg-gray-800 text-center py-1 rounded mb-2">
					This chat has been ended by an admin.
				</p>
			)}
			{isFrozen && !isEnded && (
				<p className="text-xs text-yellow-700 bg-yellow-100 text-center py-1 rounded mb-2">
					This chat is temporarily frozen by admin.
				</p>
			)}

			{/* Chat messages */}
			<div className="flex-1 overflow-y-auto space-y-2 mb-2">
				{messages.map((msg, i) => {
					const isSelf = msg.sender._id === user._id;
					return (
						<div
							key={msg._id || i}
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
				{isOtherUserTyping && (
					<div className="text-xs text-gray-500 italic ml-2">
						✍️ {user.role === "creator" ? "Editor" : "Creator"} is typing...
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="flex gap-2">
				<input
					value={newMessage}
					onChange={handleInputChange}
					type="text"
					placeholder={isFrozen || isEnded ? "Chat is disabled" : "Type a message..."}
					disabled={isFrozen || isEnded}
					className="flex-1 px-3 py-2 border rounded-md disabled:bg-gray-100"
				/>
				<button
					onClick={handleSend}
					disabled={isFrozen || isEnded}
					className={`px-4 py-2 rounded-md text-white ${
						isFrozen || isEnded ? "bg-gray-300" : "bg-roseclub-accent hover:bg-roseclub-dark"
					}`}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatWindow;
