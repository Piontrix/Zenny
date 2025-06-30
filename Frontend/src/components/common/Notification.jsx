import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Notification = ({ id, type = "info", title, message, duration = 5000, onClose, className = "" }) => {
	useEffect(() => {
		if (duration && onClose) {
			const timer = setTimeout(() => {
				onClose(id);
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration, onClose, id]);

	const typeClasses = {
		success: {
			container: "bg-green-50 border-green-200",
			icon: "text-green-400",
			title: "text-green-800",
			message: "text-green-700",
			closeButton: "text-green-400 hover:text-green-600",
		},
		error: {
			container: "bg-red-50 border-red-200",
			icon: "text-red-400",
			title: "text-red-800",
			message: "text-red-700",
			closeButton: "text-red-400 hover:text-red-600",
		},
		warning: {
			container: "bg-yellow-50 border-yellow-200",
			icon: "text-yellow-400",
			title: "text-yellow-800",
			message: "text-yellow-700",
			closeButton: "text-yellow-400 hover:text-yellow-600",
		},
		info: {
			container: "bg-blue-50 border-blue-200",
			icon: "text-blue-400",
			title: "text-blue-800",
			message: "text-blue-700",
			closeButton: "text-blue-400 hover:text-blue-600",
		},
	};

	const classes = typeClasses[type];

	return (
		<div className={`relative p-4 border rounded-lg shadow-sm ${classes.container} ${className}`} role="alert">
			<div className="flex items-start">
				<div className="flex-shrink-0">
					<div className={`w-5 h-5 ${classes.icon}`}>
						{type === "success" && (
							<svg fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						)}
						{type === "error" && (
							<svg fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						)}
						{type === "warning" && (
							<svg fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						)}
						{type === "info" && (
							<svg fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</div>
				</div>
				<div className="ml-3 flex-1">
					{title && <h3 className={`text-sm font-medium ${classes.title}`}>{title}</h3>}
					{message && <div className={`mt-1 text-sm ${classes.message}`}>{message}</div>}
				</div>
				{onClose && (
					<div className="ml-auto pl-3">
						<button
							type="button"
							className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${classes.closeButton}`}
							onClick={() => onClose(id)}
						>
							<span className="sr-only">Dismiss</span>
							<XMarkIcon className="h-5 w-5" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Notification;
