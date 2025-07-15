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

	// Fetch messages
	useEffect(() => {
		const fetchMessages = async () => {
			if (!token || !roomId) return;

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

	// Typing indicators
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

	// Seen status
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

	// Chat state updates
	useEffect(() => {
		if (!socket || !roomId) return;

		const handleChatFrozen = () => setSelectedChat((prev) => ({ ...prev, isFrozen: true }));
		const handleChatEnded = () => setSelectedChat((prev) => ({ ...prev, isEnded: true }));
		const handleChatUnfrozen = () => setSelectedChat((prev) => ({ ...prev, isFrozen: false }));
		const handleChatReopened = () => setSelectedChat((prev) => ({ ...prev, isEnded: false }));

		socket.on("chatFrozen", handleChatFrozen);
		socket.on("chatEnded", handleChatEnded);
		socket.on("chatUnfrozen", handleChatUnfrozen);
		socket.on("chatReopened", handleChatReopened);

		return () => {
			socket.off("chatFrozen", handleChatFrozen);
			socket.off("chatEnded", handleChatEnded);
			socket.off("chatUnfrozen", handleChatUnfrozen);
			socket.off("chatReopened", handleChatReopened);
		};
	}, [socket, roomId, setSelectedChat]);

	// Input
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

			clearTimeout(typingTimeoutRef.current);
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

	// Send
	const handleSend = async () => {
		if (!newMessage.trim() || !roomId || !token || isFrozen || isEnded) return;

		try {
			const res = await axios.post(
				API.SEND_MESSAGE,
				{ chatRoomId: roomId, content: newMessage },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			socket.emit("sendMessage", {
				...res.data.data,
				chatRoom: roomId,
				sender: { _id: user._id },
			});

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
		<div className="flex-1 flex flex-col bg-white">
			{/* Fixed Header */}
			<div className="sticky top-0 z-50 bg-white p-4 shadow border-b flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">
						{user.role === "creator" ? selectedChat.editor?.username : selectedChat.creator?.email}
					</h2>
					<p className="text-xs text-gray-500 capitalize">{user.role === "creator" ? "Editor" : "Creator"}</p>
				</div>
			</div>

			{/* Freeze / Ended */}
			{isEnded && (
				<div className="text-sm text-white text-center bg-gray-800 py-1">This chat has been ended by an admin.</div>
			)}
			{isFrozen && !isEnded && (
				<div className="text-sm text-yellow-800 text-center bg-yellow-100 py-1">
					This chat is temporarily frozen by admin.
				</div>
			)}

			{/* Chat Area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-transparent">
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

				{/* Typing indicator */}
				{isOtherUserTyping && (
					<div className="text-xs text-gray-500 italic ml-2">
						✍️ {user.role === "creator" ? "Editor" : "Creator"} is typing...
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="p-4 border-t flex gap-2">
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
