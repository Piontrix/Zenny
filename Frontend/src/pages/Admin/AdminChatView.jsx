import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "../../components/Chat/MessageBubble";
import toast from "react-hot-toast";
import API from "../../constants/api";
import axiosInstance from "../../api/axios";

const AdminChatView = () => {
	const { roomId } = useParams();
	const { user } = useAuth();
	const { socket } = useSocket();

	const [messages, setMessages] = useState([]);
	const [roomInfo, setRoomInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);

	const fetchMessages = async () => {
		try {
			const res = await axiosInstance.get(API.GET_MESSAGES(roomId));
			setMessages(res.data.data || []);
		} catch (err) {
			console.error("Failed to fetch messages", err);
		}
	};

	const fetchRoomInfo = async () => {
		try {
			const res = await axiosInstance.get(API.ADMIN_GET_CHAT_ROOMS);
			const found = res.data.data.find((r) => r._id === roomId);
			setRoomInfo(found);
		} catch (err) {
			console.error("Failed to fetch room info", err);
		}
	};

	useEffect(() => {
		if (user?.role === "admin") {
			fetchRoomInfo();
			fetchMessages();
		}
	}, [roomId, user]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleFreeze = async () => {
		try {
			setLoading(true);
			await axiosInstance.patch(API.ADMIN_FREEZE_CHAT(roomId));
			socket.emit("freezeChatRoom", { roomId });
			await fetchRoomInfo();
			toast.success("Chat room frozen successfully");
		} catch (err) {
			console.error("Error freezing chat room", err);
			toast.error("Failed to freeze chat room");
		} finally {
			setLoading(false);
		}
	};

	const handleEnd = async () => {
		try {
			setLoading(true);
			await axiosInstance.patch(API.ADMIN_END_CHAT(roomId));
			socket.emit("endChatRoom", { roomId });
			await fetchRoomInfo();
			toast.success("Chat room ended successfully");
		} catch (err) {
			console.error("Error ending chat room", err);
			toast.error("Failed to end chat room");
		} finally {
			setLoading(false);
		}
	};

	const handleUnfreeze = async () => {
		try {
			setLoading(true);
			await axiosInstance.patch(API.ADMIN_UNFREEZE_CHAT(roomId));
			socket.emit("unfreezeChatRoom", { roomId });
			await fetchRoomInfo();
			toast.success("Chat room unfrozen successfully");
		} catch (err) {
			console.error("Error unfreezing chat room", err);
			toast.error("Failed to unfreeze chat room");
		} finally {
			setLoading(false);
		}
	};

	const handleUnend = async () => {
		try {
			setLoading(true);
			await axiosInstance.patch(API.ADMIN_UNEND_CHAT(roomId));
			socket.emit("reopenChatRoom", { roomId });
			await fetchRoomInfo();
			toast.success("Chat room reopened successfully");
		} catch (err) {
			console.error("Error reopening chat room", err);
			toast.error("Failed to reopen chat room");
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

					<div className="mt-3 flex gap-3 flex-wrap">
						{roomInfo.isFrozen && !roomInfo.isEnded && (
							<button
								onClick={handleUnfreeze}
								disabled={loading}
								className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								{loading ? "Unfreezing..." : "Unfreeze"}
							</button>
						)}

						{roomInfo.isEnded && (
							<button
								onClick={handleUnend}
								disabled={loading}
								className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
							>
								{loading ? "Reopening..." : "Reopen Chat"}
							</button>
						)}

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
