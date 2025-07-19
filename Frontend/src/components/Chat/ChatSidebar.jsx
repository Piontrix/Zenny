import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import API from "../../constants/api";
import LoaderSpinner from "../common/LoaderSpinner";
import { Link } from "react-router-dom";

const ChatSidebar = ({ selectedChatId, onSelectChat }) => {
	const { user } = useAuth();
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const res = await axiosInstance.get(API.MY_CHAT_ROOMS);
				const data = res.data.data || [];
				setChats(data); // ✅ correct usage
			} catch (err) {
				console.error("❌ Failed to fetch chats", err);
			} finally {
				setLoading(false);
			}
		};

		if (user) fetchChats();
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
					<div className="flex justify-center py-8">
						<LoaderSpinner color="white" />
					</div>
				) : chats.length === 0 ? (
					<p className="text-sm p-4 italic text-white/80">
						{user?.role === "creator" ? (
							<>
								No chats yet. Go to{" "}
								<Link to="/portfolio" className="underline text-white hover:text-roseclub-accent">
									Portfolio
								</Link>{" "}
								and message an editor.
							</>
						) : (
							"No creators have contacted you yet. Please wait."
						)}
					</p>
				) : (
					chats.map((chat) => {
						const other = getOtherUser(chat);
						const isSelected = chat._id === selectedChatId;

						return (
							<div
								key={chat._id}
								onClick={() => onSelectChat(chat)}
								className={`p-3 cursor-pointer transition-all border-b border-white/10 
									${isSelected ? "bg-roseclub-medium font-bold" : "hover:bg-roseclub-medium"}`}
							>
								<p className="text-sm">{other?.username || other?.email || "Unknown"}</p>
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
