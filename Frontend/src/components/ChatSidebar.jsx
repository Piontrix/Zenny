import { useEffect, useState } from "react";
import axios from "axios";
import { getMockUser } from "../helpers/mockAuth"; // Adjust path if needed

const ChatSidebar = ({ onSelectChat }) => {
	const user = getMockUser();

	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const res = await axios.get("http://localhost:4000/api/chat/my-rooms", {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
				setChats(res.data || []);
			} catch (err) {
				console.error("❌ Failed to fetch chats", err);
			} finally {
				setLoading(false);
			}
		};

		fetchChats();
	}, [user]);

	const getOtherUser = (chat) => {
		return chat.participants.find((p) => p._id !== user._id);
	};

	return (
		<div className="w-72 h-full bg-roseclub-light text-white flex flex-col border-r border-white/10">
			<div className="p-4 font-bold text-xl border-b border-white/20">Your Chats</div>

			<div className="flex-1 overflow-y-auto">
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
								<p className="font-semibold text-sm">{other?.username || "Unknown User"}</p>
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
