import CoreValues from "./CoreValues";

const CoreValuesSection = () => {
	return (
		<div className="max-w-7xl mx-auto space-y-12">
			{/* Core Values Grid */}
			<CoreValues />

			{/* Final Text */}
			<div className="text-center text-white">
				<p className="text-lg sm:text-xl font-medium">Let’s redefine collaboration. Let’s create Zenny magic. 💖</p>
				<p className="text-sm text-white/80 mt-4 italic">
					We’re building a space where creative work flows effortlessly, because at Zenny, the process should feel as
					good as the final product. ✨
				</p>
			</div>
		</div>
	);
};

export default CoreValuesSection;
