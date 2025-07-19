import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import LoaderSpinner from "../common/LoaderSpinner";

const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ selectedChat, setSelectedChat, allChats = [] }) => {
	const { socket } = useSocket();
	const { user } = useAuth();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loadingMessages, setLoadingMessages] = useState(true);
	const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	const roomId = selectedChat?._id;
	const isFrozen = selectedChat?.isFrozen;
	const isEnded = selectedChat?.isEnded;

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	useEffect(() => {
		if (!selectedChat && allChats.length && roomId) {
			const found = allChats.find((c) => c._id === roomId);
			if (found) setSelectedChat(found);
		}
	}, [selectedChat, allChats, roomId, setSelectedChat]);

	useEffect(() => {
		if (socket && roomId && user?._id) {
			socket.emit("joinRoom", { roomId, userId: user._id });
		}
	}, [socket, roomId, user]);

	useEffect(() => {
		const fetchMessages = async () => {
			if (!roomId) return;
			try {
				setLoadingMessages(true);
				const res = await axiosInstance.get(API.GET_MESSAGES(roomId));
				setMessages(res.data.data || []);
			} catch (err) {
				console.error("❌ Error fetching messages", err);
			} finally {
				setLoadingMessages(false);
			}
		};
		fetchMessages();
	}, [roomId]);

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
		return () => socket.off("newMessage", handleNewMessage);
	}, [socket, user, roomId]);

	useEffect(() => {
		if (!socket || !selectedChat) return;

		const handleTyping = ({ user: typingUser }) => {
			if (typingUser._id !== user._id && typingUser.role !== user.role) setIsOtherUserTyping(true);
		};
		const handleStopTyping = ({ user: typingUser }) => {
			if (typingUser._id !== user._id && typingUser.role !== user.role) setIsOtherUserTyping(false);
		};

		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);
		return () => {
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
		};
	}, [socket, user, selectedChat]);

	useEffect(() => {
		if (!socket) return;

		const handleMessageSeen = ({ messageId }) => {
			setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg)));
		};
		socket.on("messageSeen", handleMessageSeen);
		return () => socket.off("messageSeen", handleMessageSeen);
	}, [socket]);

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

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		if (!socket || !roomId) return;
		socket.emit("typing", { roomId, user });
		clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => {
			socket.emit("stopTyping", { roomId, user });
		}, 2000);
	};

	const handleSend = async () => {
		if (!newMessage.trim() || !roomId || isFrozen || isEnded) return;
		try {
			const res = await axiosInstance.post(API.SEND_MESSAGE, {
				chatRoomId: roomId,
				content: newMessage,
			});

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
			<div className="sticky top-16 z-30 bg-white p-4 shadow border-b flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">
						{user.role === "creator" ? selectedChat.editor?.username : selectedChat.creator?.email}
					</h2>
					<p className="text-xs text-gray-500 capitalize">{user.role === "creator" ? "Editor" : "Creator"}</p>
				</div>
			</div>

			{/* Banners */}
			{isEnded && <div className="text-sm text-white text-center bg-gray-800 py-1">Chat ended by admin.</div>}
			{isFrozen && !isEnded && (
				<div className="text-sm text-yellow-800 text-center bg-yellow-100 py-1">Chat frozen by admin.</div>
			)}

			{/* Chat Scroll Area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-rose-300 max-h-[calc(100vh-10rem)] pb-16">
				{loadingMessages ? (
					<div className="flex justify-center mt-8">
						<LoaderSpinner size="lg" />
					</div>
				) : (
					messages.map((msg, idx) => {
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
					})
				)}
				{isOtherUserTyping && (
					<div className="text-xs text-gray-500 italic ml-2">
						✍️ {user.role === "creator" ? "Editor" : "Creator"} is typing...
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Field */}
			<div className="p-4 flex gap-2 w-full bg-white absolute bottom-0 left-0">
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
