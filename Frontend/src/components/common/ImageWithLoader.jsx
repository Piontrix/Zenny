import React, { useState } from "react";

const ImageWithLoader = ({ src, alt, className = "" }) => {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className={`relative w-full ${className}`}>
			{/* Skeleton Loader (background) */}
			<div
				className={`absolute inset-0 bg-roseclub-light animate-pulse rounded-2xl ${
					loaded ? "opacity-0" : "opacity-100"
				} transition-opacity duration-500`}
			></div>

			{/* Image */}
			<img
				src={src}
				alt={alt}
				onLoad={() => setLoaded(true)}
				className={`rounded-2xl w-full h-auto transition-all duration-700 ease-in-out ${
					loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
				}`}
			/>
		</div>
	);
};

export default ImageWithLoader;
