const HeroFormModal = ({ isOpen, onClose, formData, setFormData, role, setRole, onSubmit }) => {
	if (!isOpen) return null;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
			<div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative border border-roseclub-light bg-roseclub-paper/70 backdrop-blur-md">
				{/* Close */}
				<button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl">
					×
				</button>

				<h2 className="text-2xl font-semibold text-roseclub-dark mb-3">One-Time Connect Form</h2>
				<p className="text-sm text-roseclub-medium mb-6">
					This helps us match creators with editors. No signup required. No pressure.
				</p>

				<form onSubmit={onSubmit} className="space-y-4">
					{/* Name */}
					<div className="text-left">
						<label className="block text-roseclub-dark font-medium mb-1">
							Name <span className="text-red-500">*</span>
						</label>
						<input name="name" value={formData.name} onChange={handleChange} required className="inputStyle w-full" />
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
	);
};

export default HeroFormModal;
