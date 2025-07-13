import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

const ChatPage = () => {
	const { isConnected } = useSocket();
	const [selectedChat, setSelectedChat] = useState(null);

	return (
		<div className="h-screen w-full flex font-sans bg-roseclub-paper">
			<ChatSidebar onSelectChat={setSelectedChat} />
			<ChatWindow selectedChat={selectedChat} />
			<div className="absolute bottom-2 left-2 text-xs text-gray-500">
				Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
			</div>
		</div>
	);
};

export default ChatPage;
