import { Link } from "react-router-dom";

const ChatRoomCard = ({ room, onFreeze, onEnd }) => {
	return (
		<div className="border p-4 rounded shadow-sm bg-white">
			<div className="flex justify-between items-start">
				<div>
					<p className="text-sm text-gray-600">Room ID: {room._id}</p>
					<p>
						<b>Creator:</b> {room.creator?.username || room.creator?.email}
					</p>
					<p>
						<b>Editor:</b> {room.editor?.username || room.editor?.email}
					</p>
				</div>

				<div className="space-x-2">
					{room.isEnded ? (
						<span className="text-red-600 font-semibold">Ended</span>
					) : room.isFrozen ? (
						<span className="text-yellow-600 font-semibold">Frozen</span>
					) : (
						<span className="text-green-600 font-semibold">Active</span>
					)}
				</div>
			</div>

			<div className="mt-3 flex gap-2">
				<button
					onClick={() => onFreeze(room._id)}
					disabled={room.isFrozen || room.isEnded}
					className="bg-yellow-500 text-white px-3 py-1 rounded disabled:bg-gray-300"
				>
					Freeze
				</button>
				<button
					onClick={() => onEnd(room._id)}
					disabled={room.isEnded}
					className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
				>
					End
				</button>
				<Link to={`/admin/dashboard/chat-rooms/${room._id}`}>
					<button className="bg-blue-600 text-white px-3 py-1 rounded">View</button>
				</Link>
			</div>
		</div>
	);
};

export default ChatRoomCard;
