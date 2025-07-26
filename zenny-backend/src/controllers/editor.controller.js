import User from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const updateEditorPortfolioStructure = async (req, res) => {
	try {
		const { editorId } = req.params;
		const editor = await User.findOne({ _id: editorId, role: "editor" }).select("-password");
		if (!editor) return res.status(404).json({ message: "Editor not found" });

		const { tiers, whatsIncluded } = req.body;
		const parsedTiers = typeof tiers === "string" ? JSON.parse(tiers) : tiers;
		const parsedIncluded = typeof whatsIncluded === "string" ? JSON.parse(whatsIncluded) : whatsIncluded;

		editor.portfolio = {
			tiers: parsedTiers,
			whatsIncluded: parsedIncluded,
		};

		await editor.save();
		res.status(200).json({ message: "Portfolio structure updated", data: editor });
	} catch (err) {
		console.error("❌ Error updating portfolio structure:", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const uploadEditorPortfolioSamples = async (req, res) => {
	try {
		const { editorId } = req.params;
		const editor = await User.findOne({ _id: editorId, role: "editor" }).select("-password");
		if (!editor) return res.status(404).json({ message: "Editor not found" });

		if (!editor.portfolio || !editor.portfolio.tiers) {
			return res.status(400).json({ message: "Portfolio structure must be created first." });
		}

		if (req.files && Array.isArray(req.files)) {
			for (const file of req.files) {
				const cloudinaryRes = await uploadOnCloudinary(file.path);
				if (!cloudinaryRes?.secure_url) continue;
				fs.unlinkSync(file.path);
				const tier = file.fieldname.split("_")[0]; // fieldname: "basic_sample"
				const tags = req.body[`${tier}_tags`] ? JSON.parse(req.body[`${tier}_tags`]) : [];
				const type = file.mimetype.startsWith("video") ? "video" : "image";

				const targetTier = editor.portfolio.tiers.find((t) => t.title === tier);
				if (targetTier) {
					targetTier.samples = targetTier.samples || [];
					targetTier.samples.push({
						url: cloudinaryRes.secure_url,
						type,
						tags,
					});
				}
			}
		}

		await editor.save();
		res.status(200).json({ message: "Portfolio samples uploaded", data: editor });
	} catch (err) {
		console.error("❌ Error uploading portfolio samples:", err);
		res.status(500).json({ message: "Server error" });
	}
};
