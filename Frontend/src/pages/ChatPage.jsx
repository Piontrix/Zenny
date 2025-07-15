import { useState } from "react";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
	const { isConnected } = useSocket();
	const [selectedChat, setSelectedChat] = useState(null);

	return (
		<div className="h-screen w-full flex flex-col md:flex-row font-sans bg-roseclub-paper">
			<ChatSidebar onSelectChat={setSelectedChat} />
			<ChatWindow selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
			<div className="absolute bottom-2 left-2 text-xs text-gray-500 hidden md:block">
				Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
			</div>
		</div>
	);
};

export default ChatPage;
