import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import ChatRoomCard from "../../components/Chat/ChatRoomCard";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AdminChatRooms = () => {
	const [chatRooms, setChatRooms] = useState([]);
	const { token } = useAuth();
	const { socket } = useSocket();

	const fetchRooms = async () => {
		try {
			const res = await axios.get("http://localhost:4000/api/admin/chat-rooms", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setChatRooms(res.data.data);
		} catch (err) {
			console.error("Error fetching chat rooms", err);
		}
	};

	useEffect(() => {
		if (token) {
			fetchRooms();
		}
	}, [token]);

	const handleFreeze = async (roomId) => {
		try {
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/freeze`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
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
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/end`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			socket.emit("endChatRoom", { roomId });
			await fetchRooms();
			toast.success("Chat room Ended successfully");
		} catch (err) {
			console.error("Error ending chat room", err);
			toast.error("Failed to end chat room");
		}
	};
	const handleUnfreeze = async (roomId) => {
		try {
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/unfreeze`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
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
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/unend`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
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
