const WhyReachOut = () => {
	return (
		<div className="bg-white/60 backdrop-blur-lg p-6 rounded-xl shadow-md space-y-4 relative overflow-hidden group">
			{/* Decorative Icon */}
			<div className="absolute -top-6 -right-6 text-6xl opacity-10 group-hover:opacity-20 transition">💌</div>

			<h3 className="text-2xl sm:text-3xl font-romantic text-roseclub-accent text-center mb-4">Why Reach Out?</h3>

			<ul className="text-roseclub-dark text-sm sm:text-base space-y-3 list-disc list-inside">
				<li>Got a cool project or collab idea? Let’s build something ✨</li>
				<li>Bug or glitch ruining the vibe? We’re on it 🔧</li>
				<li>Feedback, features, or fan mail? We love it all 💬</li>
				<li>Brands & businesses — yes, we’re open to chat 💼</li>
			</ul>

			<p className="text-xs text-center mt-6 italic text-roseclub-medium">
				We vibe back faster than your last crush. Promise. 💖
			</p>
		</div>
	);
};

export default WhyReachOut;
