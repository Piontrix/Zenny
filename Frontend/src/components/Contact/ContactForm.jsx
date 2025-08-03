import { useState } from "react";
import API from "../../constants/api";

const ContactForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");
		setSuccess(false);

		try {
			const response = await fetch(API.SUBMIT_SUPPORT_TICKET, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || "Submission failed");
			}

			setSuccess(true);
			setFormData({ name: "", email: "", subject: "", message: "" });
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
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

			{error && <p className="text-red-600 text-sm">{error}</p>}
			{success && <p className="text-green-600 text-sm">Ticket submitted successfully!</p>}

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full bg-roseclub-accent text-white py-3 rounded-full font-semibold hover:bg-roseclub-dark transition disabled:opacity-50"
			>
				{isSubmitting ? "Sending..." : "Raise A Ticket 💌"}
			</button>
		</form>
	);
};

export default ContactForm;
