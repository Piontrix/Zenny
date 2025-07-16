import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import ChatRoomCard from "../../components/Chat/ChatRoomCard";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import API from "../../constants/api";
import axiosInstance from "../../api/axios"; // ✅ use axiosInstance

const AdminChatRooms = () => {
	const [chatRooms, setChatRooms] = useState([]);
	const { socket } = useSocket();
	const { user } = useAuth();

	const fetchRooms = async () => {
		try {
			const res = await axiosInstance.get(API.ADMIN_GET_CHAT_ROOMS);
			setChatRooms(res.data.data);
		} catch (err) {
			console.error("Error fetching chat rooms", err);
		}
	};

	useEffect(() => {
		if (user?.role === "admin") {
			fetchRooms();
		}
	}, [user]);

	const handleFreeze = async (roomId) => {
		try {
			await axiosInstance.patch(API.ADMIN_FREEZE_CHAT(roomId));
			socket.emit("freezeChatRoom", { roomId });
			await fetchRooms();
			toast.success("Chat room frozen successfully");
		} catch (err) {
			console.error("Error freezing chat room", err);
			toast.error("Failed to freeze chat room");
		}
	};

	const handleEnd = async (roomId) => {
		try {
			await axiosInstance.patch(API.ADMIN_END_CHAT(roomId));
			socket.emit("endChatRoom", { roomId });
			await fetchRooms();
			toast.success("Chat room ended successfully");
		} catch (err) {
			console.error("Error ending chat room", err);
			toast.error("Failed to end chat room");
		}
	};

	const handleUnfreeze = async (roomId) => {
		try {
			await axiosInstance.patch(API.ADMIN_UNFREEZE_CHAT(roomId));
			socket.emit("unfreezeChatRoom", { roomId });
			await fetchRooms();
			toast.success("Chat room unfrozen successfully");
		} catch (err) {
			console.error("Error unfreezing chat room", err);
			toast.error("Failed to unfreeze chat room");
		}
	};

	const handleUnend = async (roomId) => {
		try {
			await axiosInstance.patch(API.ADMIN_UNEND_CHAT(roomId));
			socket.emit("reopenChatRoom", { roomId });
			await fetchRooms();
			toast.success("Chat room reopened successfully");
		} catch (err) {
			console.error("Error reopening chat room", err);
			toast.error("Failed to reopen chat room");
		}
	};

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">All Chat Rooms</h2>
			{chatRooms.length === 0 ? (
				<p>No chat rooms found</p>
			) : (
				<div className="space-y-4">
					{chatRooms.map((room) => (
						<ChatRoomCard
							key={room._id}
							room={room}
							onFreeze={handleFreeze}
							onEnd={handleEnd}
							onUnfreeze={handleUnfreeze}
							onUnend={handleUnend}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default AdminChatRooms;
