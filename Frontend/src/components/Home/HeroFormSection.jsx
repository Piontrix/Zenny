import { useState } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
	const [role, setRole] = useState("Editor");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		followerCount: "",
	});
	const [showModal, setShowModal] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("🚀 Submitted Form Data:", { ...formData, role });
		// Reset
		setFormData({ name: "", email: "", phone: "", followerCount: "" });
		setRole("Editor");
		setShowModal(false);
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center px-6 md:px-20 py-20 bg-roseclub-light overflow-hidden font-romantic text-center">
			{/* 🎨 Background blobs */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-roseclub-accent rounded-full blur-3xl opacity-30 hidden md:block z-0 animate-pulse"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-roseclub-dark rounded-full blur-2xl md:opacity-40 opacity-0 animate-bounce z-0"></div>

			{/* Main Text Content */}
			<div className="z-10 max-w-2xl space-y-6 text-roseclub-dark">
				<h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-sm leading-snug">
					Where Creators & Editors Meet 💌
				</h1>

				<p className="text-xl sm:text-2xl font-bold text-roseclub-dark leading-relaxed drop-shadow-sm ">
					At <span className="font-extrabold text-roseclub-accent">Zenny</span>, we help you turn imagination into
					reality — without revealing your identity. Anonymous. Seamless. Real work.
				</p>

				<div className="flex justify-center gap-4 flex-wrap">
					<Link to="/about">
						<button className="px-6 py-2 bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
							Learn More
						</button>
					</Link>
					<button
						onClick={() => setShowModal(true)}
						className="px-6 py-2 border border-roseclub-accent text-roseclub-accent hover:bg-roseclub-accent hover:text-white rounded-full transition font-semibold shadow-md"
					>
						Get Started 🚀
					</button>
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
					<div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative border border-roseclub-light bg-roseclub-paper/70 backdrop-blur-md">
						{/* Close */}
						<button
							onClick={() => setShowModal(false)}
							className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
						>
							×
						</button>

						<h2 className="text-2xl font-semibold text-roseclub-dark mb-3">One-Time Connect Form</h2>
						<p className="text-sm text-roseclub-medium mb-6">
							This helps us match creators with editors. No signup required. No pressure.
						</p>

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Name */}
							<div className="text-left">
								<label className="block text-roseclub-dark font-medium mb-1">
									Name <span className="text-red-500">*</span>
								</label>
								<input
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className="inputStyle w-full"
								/>
							</div>

							{/* Email */}
							<div className="text-left">
								<label className="block text-roseclub-dark font-medium mb-1">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="inputStyle w-full"
								/>
							</div>

							{/* Phone */}
							<div className="text-left">
								<label className="block text-roseclub-dark font-medium mb-1">
									Phone Number <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									required
									className="inputStyle w-full"
								/>
							</div>

							{/* Role */}
							<div className="text-left">
								<label className="block text-roseclub-dark font-medium mb-1">
									Role <span className="text-red-500">*</span>
								</label>
								<select value={role} onChange={(e) => setRole(e.target.value)} required className="inputStyle w-full">
									<option value="Editor">Editor</option>
									<option value="Creator">Creator</option>
								</select>
							</div>

							{/* Follower Count */}
							{role === "Creator" && (
								<div className="text-left">
									<label className="block text-roseclub-dark font-medium mb-1">Follower Count</label>
									<input
										type="number"
										name="followerCount"
										value={formData.followerCount}
										onChange={handleChange}
										className="inputStyle w-full"
									/>
								</div>
							)}

							{/* Submit */}
							<button
								type="submit"
								className="w-full bg-roseclub-accent text-white py-3 rounded-full font-semibold hover:bg-roseclub-dark transition"
							>
								Submit & Connect
							</button>
						</form>
					</div>
				</div>
			)}
		</section>
	);
};

export default HeroSection;
