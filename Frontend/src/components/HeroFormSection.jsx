import { useState } from "react";
import { Link } from "react-router-dom";

const HeroFormSection = () => {
	const [role, setRole] = useState("Editor");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
		followerCount: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("🚀 Submitted Form Data:", {
			...formData,
			role,
		});
		setFormData({
			name: "",
			email: "",
			phone: "",
			message: "",
			followerCount: "",
		});
		setRole("Editor");
	};

	return (
		<section className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-gradient-to-br from-pink-100 via-rose-200 to-pink-50 overflow-hidden">
			{/* 🎨 Background Animation */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-400 rounded-full blur-3xl animate-pulse z-0"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-violet-400 rounded-full blur-2xl animate-bounce z-0"></div>

			{/* Left: Text */}
			<div className="md:w-1/2 space-y-6 z-10 text-gray-900">
				<h1 className="text-4xl md:text-5xl font-extrabold text-zenny-dark drop-shadow-md">
					Connect. Collaborate. Create.
				</h1>
				<p className="text-lg font-medium text-gray-800 max-w-md leading-relaxed drop-shadow-sm">
					At <span className="font-semibold text-zenny-accent">Zenny</span>, creators & editors connect anonymously to
					get real work done — no more chasing DMs or unclear edits.
				</p>
				<Link to="/about">
					<button className="px-5 py-2 bg-zenny-accent text-white rounded-full hover:bg-zenny-dark transition font-semibold shadow-md cursor-pointer">
						Learn More
					</button>
				</Link>
			</div>

			{/* Right: Form */}
			<div className="md:w-1/2 w-full max-w-md z-10 mt-12 md:mt-0 relative">
				<div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 blur-xl opacity-30 pointer-events-none"></div>

				<form
					className="relative bg-white/30 border border-white/20 shadow-2xl rounded-2xl p-6 space-y-4 backdrop-blur-lg z-10"
					onSubmit={handleSubmit}
				>
					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Name <span className="text-red-500">*</span>
						</label>
						<input name="name" value={formData.name} onChange={handleChange} required className="inputStyle" />
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="inputStyle"
						/>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-1">
							Phone Number <span className="text-red-500">*</span>
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							required
							className="inputStyle"
						/>
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
						<textarea name="message" value={formData.message} onChange={handleChange} className="inputStyle" rows={2} />
					</div>

					{role === "Creator" && (
						<div className="transition-all duration-300">
							<label className="block text-gray-700 font-medium mb-1">Follower Count</label>
							<input
								type="number"
								name="followerCount"
								value={formData.followerCount}
								onChange={handleChange}
								className="inputStyle"
							/>
						</div>
					)}

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
};

export default HeroFormSection;
