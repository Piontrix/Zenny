import { useState } from "react";

const ImageWithLoader = ({ src, alt = "", className = "", ...rest }) => {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<div className={`relative w-full h-full ${className}`}>
			{/* Skeleton Loader */}
			{!isLoaded && <div className="absolute inset-0 bg-roseclub-light animate-pulse rounded-lg" />}

			{/* Actual Image */}
			<img
				src={src}
				alt={alt}
				onLoad={() => setIsLoaded(true)}
				className={`transition-opacity duration-500 ease-in-out w-full h-full object-cover rounded-lg ${
					isLoaded ? "opacity-100" : "opacity-0"
				}`}
				{...rest}
			/>
		</div>
	);
};

export default ImageWithLoader;
