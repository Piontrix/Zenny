import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import API from "../../constants/api";

const ChatSidebar = ({ onSelectChat }) => {
	const { user } = useAuth();
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const res = await axiosInstance.get(API.MY_CHAT_ROOMS);
				setChats(res.data.data || []);
			} catch (err) {
				console.error("❌ Failed to fetch chats", err);
			} finally {
				setLoading(false);
			}
		};

		if (user) fetchChats(); // ✅ Only fetch if user exists
	}, [user]);

	const getOtherUser = (chat) => {
		if (user?.role === "creator") return chat.editor;
		if (user?.role === "editor") return chat.creator;
		return null;
	};

	return (
		<div className="h-full flex flex-col text-white">
			<div className="p-4 font-bold text-lg border-b border-white/20">Your Chats</div>
			<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30">
				{loading ? (
					<p className="text-sm p-4">Loading chats...</p>
				) : chats.length === 0 ? (
					<p className="text-sm p-4">No chats yet</p>
				) : (
					chats.map((chat) => {
						const other = getOtherUser(chat);
						return (
							<div
								key={chat._id}
								onClick={() => onSelectChat(chat)}
								className="p-3 hover:bg-roseclub-medium cursor-pointer transition-all border-b border-white/10"
							>
								<p className="font-semibold text-sm">{other?.username || other?.email || "Unknown"}</p>
								<p className="text-xs opacity-80 truncate">{chat.lastMessage?.message || "No messages yet"}</p>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default ChatSidebar;
