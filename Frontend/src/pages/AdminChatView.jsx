import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "../components/MessageBubble";

const AdminChatView = () => {
	const { roomId } = useParams();
	const { token } = useAuth();
	const [messages, setMessages] = useState([]);
	const [roomInfo, setRoomInfo] = useState(null);
	const messagesEndRef = useRef(null);

	useEffect(() => {
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

		fetchRoomInfo();
		fetchMessages();
	}, [roomId, token]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

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
						<strong>Status:</strong> {roomInfo.isEnded ? "Ended" : roomInfo.isFrozen ? "Frozen" : "Active"}
					</p>
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
