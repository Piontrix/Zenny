import { useState } from "react";

export default function HeroFormSection() {
	const [role, setRole] = useState("Editor");

	return (
		<section className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-gradient-to-br from-pink-100 via-rose-200 to-pink-50 overflow-hidden">
			{/* 🎨 Background Animation */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-400 rounded-full blur-3xl animate-pulse z-0"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-violet-400 rounded-full blur-2xl animate-bounce z-0"></div>

			{/* Left: Text */}
			<div className="md:w-1/2 space-y-6 z-10">
				<h1 className="text-4xl md:text-5xl font-bold text-pink-700">Connect. Collaborate. Create.</h1>
				<p className="text-lg text-gray-700 max-w-md">
					At <span className="font-semibold text-pink-600">Zenny</span>, creators & editors connect anonymously to get
					real work done — no more chasing DMs or unclear edits.
				</p>
				<button className="px-5 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition">
					Learn More
				</button>
			</div>

			{/* Right: Form */}
			<div className="md:w-1/2 w-full max-w-md z-10 mt-12 md:mt-0">
				<div className="absolute -inset-[2px] z-0 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 blur-xl opacity-40"></div>

				<form className="relative bg-white/30 border border-white/20 shadow-2xl rounded-2xl p-6 space-y-4 backdrop-blur-lg z-10">
					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Name <span className="text-red-500">*</span>
						</label>
						<input type="text" required className="inputStyle" />
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Email <span className="text-red-500">*</span>
						</label>
						<input type="email" required className="inputStyle" />
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Phone Number <span className="text-red-500">*</span>
						</label>
						<input type="tel" required className="inputStyle" />
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Role <span className="text-red-500">*</span>
						</label>
						<select value={role} onChange={(e) => setRole(e.target.value)} required className="inputStyle">
							<option value="Editor">Editor</option>
							<option value="Creator">Creator</option>
						</select>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">Message</label>
						<textarea className="inputStyle" rows={2} />
					</div>

					{/* Animate show/hide instead of changing height of parent */}
					<div
						className={`transition-all duration-300 ${
							role === "Creator" ? "opacity-100 scale-100 h-auto" : "opacity-0 scale-95 h-0 overflow-hidden"
						}`}
					>
						<label className="block text-gray-700 font-medium mb-1">Follower Count</label>
						<input type="number" className="inputStyle" />
					</div>

					<button
						type="submit"
						className="w-full bg-pink-600 text-white py-3 rounded-full font-semibold hover:bg-pink-700 transition"
					>
						Get Started 🚀
					</button>
				</form>
			</div>
		</section>
	);
}
