import { useState } from "react";
import { Link } from "react-router-dom";

const HeroFormSection = () => {
	const [role, setRole] = useState("Editor");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
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
			followerCount: "",
		});
		setRole("Editor");
	};

	return (
		<section className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-roseclub-light overflow-hidden font-romantic">
			{/* 🎨 Background Blobs */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-roseclub-accent rounded-full blur-3xl opacity-30 z-0 animate-pulse"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-roseclub-dark rounded-full blur-2xl opacity-40 animate-bounce z-0"></div>

			{/* Left: Text */}
			<div className="md:w-1/2 space-y-6 z-10 text-roseclub-dark">
				<h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-sm leading-snug">
					Where Creators & Editors Meet 💌
				</h1>
				<p className="text-2xl font-bold text-roseclub-medium max-w-md leading-relaxed drop-shadow-sm">
					At <span className="font-extrabold text-roseclub-accent">Zenny</span>, we help you turn imagination into
					reality — without revealing your identity.
				</p>
				<Link to="/about">
					<button className="px-6 py-2 bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
						Learn More
					</button>
				</Link>
			</div>

			{/* Right: Form */}
			<div className="md:w-1/2 w-full max-w-md z-10 mt-12 md:mt-0 relative">
				<div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-roseclub-accent/30 to-roseclub-dark/20 blur-xl pointer-events-none"></div>

				<form
					className="relative bg-roseclub-paper/50 border border-roseclub-light shadow-2xl rounded-2xl p-6 space-y-4 backdrop-blur-lg z-10"
					onSubmit={handleSubmit}
				>
					{/* Name */}
					<div>
						<label className="block text-roseclub-dark font-medium mb-1">
							Name <span className="text-red-500">*</span>
						</label>
						<input name="name" value={formData.name} onChange={handleChange} required className="inputStyle" />
					</div>

					{/* Email */}
					<div>
						<label className="block text-roseclub-dark font-medium mb-1">
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

					{/* Phone */}
					<div>
						<label className="block text-roseclub-dark font-medium mb-1">
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

					{/* Role */}
					<div>
						<label className="block text-roseclub-dark font-medium mb-1">
							Role <span className="text-red-500">*</span>
						</label>
						<select value={role} onChange={(e) => setRole(e.target.value)} required className="inputStyle">
							<option value="Editor">Editor</option>
							<option value="Creator">Creator</option>
						</select>
					</div>

					{/* Follower Count (conditional) */}
					{role === "Creator" && (
						<div className="transition-all duration-300">
							<label className="block text-roseclub-dark font-medium mb-1">Follower Count</label>
							<input
								type="number"
								name="followerCount"
								value={formData.followerCount}
								onChange={handleChange}
								className="inputStyle"
							/>
						</div>
					)}

					{/* Submit Button */}
					<button
						type="submit"
						className="w-full bg-roseclub-accent text-white py-3 rounded-full font-semibold hover:bg-roseclub-dark transition"
					>
						Get Started 🚀
					</button>
				</form>
			</div>
		</section>
	);
};

export default HeroFormSection;
