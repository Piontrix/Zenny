const MessageBubble = ({ msg }) => {
	const isCreator = msg.sender?.role === "creator";
	const isEditor = msg.sender?.role === "editor";

	return (
		<div
			className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
				isCreator
					? "bg-blue-100 text-blue-800 self-start"
					: isEditor
					? "bg-green-100 text-green-800 self-end"
					: "bg-gray-100 text-gray-800"
			}`}
		>
			<p>{msg.content}</p>
			<p className="text-[10px] mt-1 text-right opacity-60">
				{new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
				{" · "}
				{msg.sender?.role}
			</p>
		</div>
	);
};

export default MessageBubble;
