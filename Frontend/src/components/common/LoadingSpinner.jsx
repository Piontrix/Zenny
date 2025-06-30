import React from "react";

const LoadingSpinner = ({ size = "md", variant = "primary", className = "", text = "Loading..." }) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};

	const variantClasses = {
		primary: "text-blue-600",
		secondary: "text-gray-600",
		white: "text-white",
		dark: "text-gray-800",
	};

	return (
		<div className={`flex flex-col items-center justify-center ${className}`}>
			<div
				className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin rounded-full border-2 border-gray-300 border-t-current`}
				role="status"
				aria-label="Loading"
			/>
			{text && <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>}
		</div>
	);
};

export default LoadingSpinner;
