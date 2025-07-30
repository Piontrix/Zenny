import User from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

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

		// Check if files were uploaded
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		let successCount = 0;
		const failed = [];

		// Group files by tier and process them
		const filesByTier = {};
		req.files.forEach((file) => {
			const tier = file.fieldname.split("_")[0]; // e.g., "basic"
			if (!filesByTier[tier]) {
				filesByTier[tier] = [];
			}
			filesByTier[tier].push(file);
		});

		// Process each tier's files
		for (const [tier, files] of Object.entries(filesByTier)) {
			const targetTier = editor.portfolio.tiers.find((t) => t.title === tier);
			if (!targetTier) {
				console.warn(`❌ Tier ${tier} not found in portfolio structure`);
				continue;
			}

			// Initialize samples array if it doesn't exist
			targetTier.samples = targetTier.samples || [];

			// Process each file in this tier
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const absolutePath = path.resolve(file.path);
				const cloudinaryRes = await uploadOnCloudinary(absolutePath);

				if (!cloudinaryRes?.secure_url) {
					failed.push({
						filename: file.originalname,
						tier: tier,
						reason: "Cloudinary upload failed or invalid path",
					});
					continue;
				}

				successCount++;

				// Handle individual file tags using pattern: tier_sample_index_tags
				let tags = [];
				const individualTagsKey = `${tier}_sample_${i}_tags`;

				if (req.body[individualTagsKey]) {
					try {
						const tagsValue = req.body[individualTagsKey];
						if (typeof tagsValue === "string") {
							// Try to parse as JSON
							try {
								tags = JSON.parse(tagsValue);
							} catch {
								// If it's not JSON, treat as single tag
								tags = [tagsValue];
							}
						} else if (Array.isArray(tagsValue)) {
							tags = tagsValue;
						} else {
							tags = [tagsValue];
						}

						// Ensure tags is an array
						if (!Array.isArray(tags)) {
							tags = [];
						}
					} catch (parseError) {
						console.warn(`❌ Failed to parse tags for ${tier} sample ${i}:`, parseError.message);
						tags = [];
					}
				}

				const type = file.mimetype.startsWith("video") ? "video" : "image";

				// Add the sample to the tier
				targetTier.samples.push({
					url: cloudinaryRes.secure_url,
					type,
					tags,
				});
			}
		}

		await editor.save();

		const message = failed.length
			? `Portfolio samples uploaded with ${failed.length} failure(s)`
			: "All portfolio samples uploaded successfully";

		res.status(200).json({
			message,
			successCount,
			failed,
			data: editor,
		});
	} catch (err) {
		console.error("❌ Error uploading portfolio samples:", err);
		res.status(500).json({ message: "Server error" });
	}
};
