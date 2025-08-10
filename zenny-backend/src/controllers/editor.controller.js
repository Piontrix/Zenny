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
		const MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE_MB;
		const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

		const editor = await User.findOne({ _id: editorId, role: "editor" }).select("-password");
		if (!editor) return res.status(404).json({ message: "Editor not found" });

		if (!editor.portfolio || !editor.portfolio.tiers) {
			return res.status(400).json({ message: "Portfolio structure must be created first." });
		}

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		const oversizedFiles = req.files.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
		if (oversizedFiles.length > 0) {
			return res.status(400).json({
				message: `Some files exceed the ${MAX_FILE_SIZE_MB}MB limit.`,
				files: oversizedFiles.map((f) => f.originalname),
			});
		}

		let successCount = 0;
		const failed = [];

		const filesByTier = {};
		req.files.forEach((file) => {
			const tier = file.fieldname.split("_")[0];
			if (!filesByTier[tier]) {
				filesByTier[tier] = [];
			}
			filesByTier[tier].push(file);
		});

		for (const [tier, files] of Object.entries(filesByTier)) {
			const targetTier = editor.portfolio.tiers.find((t) => t.title === tier);
			if (!targetTier) {
				console.warn(`❌ Tier ${tier} not found in portfolio structure`);
				continue;
			}

			targetTier.samples = targetTier.samples || [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const absolutePath = path.resolve(file.path);
				const cloudinaryRes = await uploadOnCloudinary(absolutePath);

				if (!cloudinaryRes?.secure_url) {
					failed.push({
						filename: file.originalname,
						tier,
						reason: "Cloudinary upload failed or invalid path",
					});
					continue;
				}

				successCount++;

				let tags = [];
				const individualTagsKey = `${tier}_sample_${i}_tags`;

				if (req.body[individualTagsKey]) {
					try {
						const tagsValue = req.body[individualTagsKey];
						if (typeof tagsValue === "string") {
							try {
								tags = JSON.parse(tagsValue);
							} catch {
								tags = [tagsValue];
							}
						} else if (Array.isArray(tagsValue)) {
							tags = tagsValue;
						} else {
							tags = [tagsValue];
						}
						if (!Array.isArray(tags)) tags = [];
					} catch (parseError) {
						console.warn(`❌ Failed to parse tags for ${tier} sample ${i}:`, parseError.message);
						tags = [];
					}
				}

				const type = file.mimetype.startsWith("video") ? "video" : "image";

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
