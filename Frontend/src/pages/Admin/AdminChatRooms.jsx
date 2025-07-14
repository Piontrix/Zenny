import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import ChatRoomCard from "../../components/Chat/ChatRoomCard";
import { useAuth } from "../../context/AuthContext";

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
			fetchRooms();
		} catch (err) {
			console.error("Error freezing chat room", err);
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
			fetchRooms();
		} catch (err) {
			console.error("Error ending chat room", err);
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
						<ChatRoomCard key={room._id} room={room} onFreeze={handleFreeze} onEnd={handleEnd} />
					))}
				</div>
			)}
		</div>
	);
};

export default AdminChatRooms;
