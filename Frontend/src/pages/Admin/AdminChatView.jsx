import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "../../components/Chat/MessageBubble";

const AdminChatView = () => {
	const { roomId } = useParams();
	const { token } = useAuth();
	const { socket } = useSocket();

	const [messages, setMessages] = useState([]);
	const [roomInfo, setRoomInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);

	const fetchMessages = async () => {
		try {
			const res = await axios.get(`http://localhost:4000/api/chat/${roomId}/messages`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setMessages(res.data.data || []);
		} catch (err) {
			console.error("Failed to fetch messages", err);
		}
	};

	const fetchRoomInfo = async () => {
		try {
			const res = await axios.get("http://localhost:4000/api/admin/chat-rooms", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const found = res.data.data.find((r) => r._id === roomId);
			setRoomInfo(found);
		} catch (err) {
			console.error("Failed to fetch room info", err);
		}
	};

	useEffect(() => {
		if (token) {
			fetchRoomInfo();
			fetchMessages();
		}
	}, [roomId, token]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleFreeze = async () => {
		try {
			setLoading(true);
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/freeze`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			socket.emit("freezeChatRoom", { roomId });
			await fetchRoomInfo();
		} catch (err) {
			console.error("Error freezing chat room", err);
		} finally {
			setLoading(false);
		}
	};

	const handleEnd = async () => {
		try {
			setLoading(true);
			await axios.patch(
				`http://localhost:4000/api/admin/chat/${roomId}/end`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			socket.emit("endChatRoom", { roomId });
			await fetchRoomInfo();
		} catch (err) {
			console.error("Error ending chat room", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h2 className="text-xl font-bold mb-2">Chat Room</h2>

			{roomInfo && (
				<div className="mb-4 text-sm text-gray-600">
					<p>
						<strong>Creator:</strong> {roomInfo.creator?.username || roomInfo.creator?.email}
					</p>
					<p>
						<strong>Editor:</strong> {roomInfo.editor?.username || roomInfo.editor?.email}
					</p>
					<p>
						<strong>Status:</strong>{" "}
						<span
							className={`font-semibold ${
								roomInfo.isEnded ? "text-red-600" : roomInfo.isFrozen ? "text-yellow-600" : "text-green-600"
							}`}
						>
							{roomInfo.isEnded ? "Ended" : roomInfo.isFrozen ? "Frozen" : "Active"}
						</span>
					</p>

					<div className="mt-3 flex gap-3">
						{!roomInfo.isFrozen && !roomInfo.isEnded && (
							<button
								onClick={handleFreeze}
								disabled={loading}
								className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
							>
								{loading ? "Freezing..." : "Freeze"}
							</button>
						)}

						{!roomInfo.isEnded && (
							<button
								onClick={handleEnd}
								disabled={loading}
								className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
							>
								{loading ? "Ending..." : "End"}
							</button>
						)}
					</div>
				</div>
			)}

			<div className="bg-white border rounded shadow p-4 h-[60vh] overflow-y-auto space-y-2">
				{messages.map((msg) => (
					<MessageBubble key={msg._id} msg={msg} />
				))}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};

export default AdminChatView;
