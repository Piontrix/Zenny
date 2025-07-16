import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import { useSocket } from "../context/SocketContext";
import axiosInstance from "../api/axios";
import API from "../constants/api";

const ChatPage = () => {
	const { isConnected } = useSocket();
	const [selectedChat, setSelectedChat] = useState(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();
	const searchParams = new URLSearchParams(location.search);
	const roomIdFromURL = searchParams.get("roomId");

	// ✅ Fetch and select chat by roomId in URL
	useEffect(() => {
		const fetchAndSelectChat = async () => {
			try {
				const res = await axiosInstance.get(API.MY_CHAT_ROOMS);
				const chats = res.data.data || [];
				if (roomIdFromURL) {
					const matched = chats.find((c) => c._id === roomIdFromURL);
					if (matched) {
						setSelectedChat(matched);
					}
				}
			} catch (err) {
				console.error("❌ Failed to auto-select chat:", err);
			}
		};

		if (roomIdFromURL && !selectedChat) {
			fetchAndSelectChat();
		}
	}, [roomIdFromURL, selectedChat]);

	// ✅ Handle selecting a chat from sidebar and update URL
	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		navigate(`/chat?roomId=${chat._id}`);
		setSidebarOpen(false); // Close sidebar on mobile
	};

	return (
		<div className="w-full h-screen flex font-sans bg-roseclub-paper max-h-[90vh]">
			{/* Sidebar Overlay for Mobile */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			{/* Sidebar */}
			<div
				className={`z-50 md:relative md:translate-x-0 transition-transform duration-300
				${sidebarOpen ? "fixed translate-x-0" : "fixed -translate-x-full"}
				top-0 left-0 h-full w-64 bg-roseclub-light`}
			>
				<ChatSidebar selectedChatId={selectedChat?._id} onSelectChat={handleSelectChat} />
			</div>

			{/* Toggle Button for Mobile */}
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="md:hidden fixed top-20 right-2 z-50 bg-white shadow-md border rounded-full p-2"
			>
				☰
			</button>

			{/* Chat Window */}
			<div className="flex-1 flex flex-col bg-white relative">
				<ChatWindow selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
			</div>

			{/* Socket Connection Status */}
			<div className="absolute bottom-2 left-2 text-xs text-gray-500 hidden md:block">
				Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
			</div>
		</div>
	);
};

export default ChatPage;
