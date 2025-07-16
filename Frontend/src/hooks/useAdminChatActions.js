import { useCallback, useState } from "react";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import API from "../constants/api";
import { useSocket } from "../context/SocketContext";

const useAdminChatActions = () => {
	const { socket } = useSocket();
	const [chatRooms, setChatRooms] = useState([]);

	const fetchRooms = useCallback(async () => {
		try {
			const res = await axiosInstance.get(API.ADMIN_GET_CHAT_ROOMS);
			setChatRooms(res.data.data);
		} catch (err) {
			console.error("Error fetching chat rooms", err);
		}
	}, []);

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

	return {
		chatRooms,
		fetchRooms,
		handleFreeze,
		handleEnd,
		handleUnfreeze,
		handleUnend,
	};
};

export default useAdminChatActions;
