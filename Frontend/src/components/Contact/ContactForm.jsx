import { useState } from "react";

const ContactForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("📨 Contact Form Submitted:", formData);
		// You can integrate emailjs / Formspree / API call here
		setFormData({ name: "", email: "", subject: "", message: "" });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white/30 border border-white/20 shadow-xl rounded-2xl p-6 space-y-4 backdrop-blur-lg"
		>
			<input
				type="text"
				name="name"
				value={formData.name}
				onChange={handleChange}
				required
				placeholder="Your Name"
				className="inputStyle"
			/>
			<input
				type="email"
				name="email"
				value={formData.email}
				onChange={handleChange}
				required
				placeholder="Your Email"
				className="inputStyle"
			/>
			<input
				type="text"
				name="subject"
				value={formData.subject}
				onChange={handleChange}
				placeholder="Subject"
				className="inputStyle"
			/>
			<textarea
				name="message"
				value={formData.message}
				onChange={handleChange}
				required
				rows={4}
				placeholder="Write your message..."
				className="inputStyle"
			/>
			<button
				type="submit"
				className="w-full bg-roseclub-accent text-white py-3 rounded-full font-semibold hover:bg-roseclub-dark transition"
			>
				Send Message 💌
			</button>
		</form>
	);
};

export default ContactForm;
