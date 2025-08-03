import { SupportTicket } from "../models/SupportTicket.model.js";

export const submitSupportTicket = async (req, res) => {
	try {
		const { name, email, subject, message } = req.body;

		if (!email || !subject || !message) {
			return res.status(400).json({ message: "Email, subject, and message are required." });
		}

		const ticket = new SupportTicket({
			name,
			email,
			subject,
			message,
		});

		await ticket.save();

		return res.status(201).json({ message: "Support ticket submitted.", ticket });
	} catch (err) {
		console.error("Support ticket error:", err);
		return res.status(500).json({ message: "Failed to submit support ticket." });
	}
};
