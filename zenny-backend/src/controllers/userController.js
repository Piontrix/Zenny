import User from "../models/User.model.js";

export const getAllVerifiedEditors = async (req, res) => {
	try {
		const editors = await User.find({ role: "editor", isVerified: true }).select("_id username portfolio");
		res.status(200).json({ message: "Editors fetched", data: editors });
	} catch (err) {
		console.error("Get editors error:", err);
		res.status(500).json({ message: "Server error" });
	}
};
