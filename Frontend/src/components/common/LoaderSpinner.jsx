const LoaderSpinner = ({ size = "md", color = "rose" }) => {
	const sizes = {
		sm: "h-4 w-4 border-2",
		md: "h-6 w-6 border-2",
		lg: "h-10 w-10 border-4",
	};

	const colors = {
		rose: "border-roseclub-accent border-t-transparent",
		white: "border-white border-t-transparent",
		dark: "border-roseclub-dark border-t-transparent",
	};

	return <div className={`animate-spin rounded-full ${sizes[size]} ${colors[color]}`} />;
};

export default LoaderSpinner;
