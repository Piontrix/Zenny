import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectNotifications, removeNotification } from "../../store/slices/uiSlice.js";
import Notification from "./Notification.jsx";

const NotificationContainer = () => {
	const dispatch = useDispatch();
	const notifications = useSelector(selectNotifications);

	const handleClose = (id) => {
		dispatch(removeNotification(id));
	};

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
			{notifications.map((notification) => (
				<Notification
					key={notification.id}
					id={notification.id}
					type={notification.type}
					title={notification.title}
					message={notification.message}
					duration={notification.duration}
					onClose={handleClose}
					className="animate-in slide-in-from-right-2 duration-300"
				/>
			))}
		</div>
	);
};

export default NotificationContainer;
