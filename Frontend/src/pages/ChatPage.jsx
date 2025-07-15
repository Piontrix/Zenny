import { useState } from "react";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
	const { isConnected } = useSocket();
	const [selectedChat, setSelectedChat] = useState(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="w-full h-screen flex font-sans bg-roseclub-paper max-h-[90vh]">
			{/* Sidebar */}
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			{/* Sidebar Container */}
			<div
				className={`z-50 md:relative md:translate-x-0 transition-transform duration-300
				${sidebarOpen ? "fixed translate-x-0" : "fixed -translate-x-full"}
				top-0 left-0 h-full w-64 bg-roseclub-light`}
			>
				<ChatSidebar
					onSelectChat={(chat) => {
						setSelectedChat(chat);
						setSidebarOpen(false); // auto-close on mobile
					}}
				/>
			</div>

			{/* Toggle Button (mobile only) */}
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

			{/* Socket Connection Status (Desktop only) */}
			<div className="absolute bottom-2 left-2 text-xs text-gray-500 hidden md:block">
				Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
			</div>
		</div>
	);
};

export default ChatPage;
