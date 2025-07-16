import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MessageBubble from "../../components/Chat/MessageBubble";
import useAdminChatActions from "../../hooks/useAdminChatActions";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import { useAuth } from "../../context/AuthContext";

const AdminChatView = () => {
	const { roomId } = useParams();
	const { user } = useAuth();
	const { handleFreeze, handleEnd, handleUnfreeze, handleUnend } = useAdminChatActions();

	const [messages, setMessages] = useState([]);
	const [roomInfo, setRoomInfo] = useState(null);
	const [loadingAction, setLoadingAction] = useState(null); // 'freeze', 'end', 'unfreeze', 'unend'
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
			fetchMessages();
			fetchRoomInfo();
		}
	}, [user, roomId]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const wrap = (fn, actionName) => async () => {
		setLoadingAction(actionName);
		await fn(roomId);
		await fetchRoomInfo();
		setLoadingAction(null);
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
								onClick={wrap(handleUnfreeze, "unfreeze")}
								disabled={!!loadingAction}
								className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								{loadingAction === "unfreeze" ? "Unfreezing..." : "Unfreeze"}
							</button>
						)}

						{roomInfo.isEnded && (
							<button
								onClick={wrap(handleUnend, "unend")}
								disabled={!!loadingAction}
								className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
							>
								{loadingAction === "unend" ? "Reopening..." : "Reopen Chat"}
							</button>
						)}

						{!roomInfo.isFrozen && !roomInfo.isEnded && (
							<button
								onClick={wrap(handleFreeze, "freeze")}
								disabled={!!loadingAction}
								className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
							>
								{loadingAction === "freeze" ? "Freezing..." : "Freeze"}
							</button>
						)}

						{!roomInfo.isEnded && (
							<button
								onClick={wrap(handleEnd, "end")}
								disabled={!!loadingAction}
								className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
							>
								{loadingAction === "end" ? "Ending..." : "End"}
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
