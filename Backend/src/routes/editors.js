import express from "express";
import { body, validationResult } from "express-validator";
import Editor from "../../shared-db/collections/editors.js";
import { EDITOR_STATUS, SERVICE_TYPES, BADGE_TYPES } from "../../shared-utils/constants.js";

const router = express.Router();

// @desc    Get all active editors with filters
// @route   GET /api/editors
// @access  Public
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 12,
			sortBy = "rating",
			sortOrder = "desc",
			tags,
			services,
			minRating,
			maxPrice,
			availability,
			search,
		} = req.query;

		// Build filter object
		const filter = { status: "active" };

		if (tags) {
			filter.tags = { $in: tags.split(",") };
		}

		if (services) {
			filter.services = { $in: services.split(",") };
		}

		if (minRating) {
			filter.rating = { $gte: parseFloat(minRating) };
		}

		if (maxPrice) {
			filter["pricing.videoEditing"] = { $lte: parseFloat(maxPrice) };
		}

		if (availability !== undefined) {
			filter.availability = availability === "true";
		}

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ bio: { $regex: search, $options: "i" } },
				{ tags: { $in: [new RegExp(search, "i")] } },
			];
		}

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === "desc" ? -1 : 1;

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Execute query
		const editors = await Editor.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).select("-adminNotes -__v");

		// Get total count for pagination
		const total = await Editor.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: editors,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching editors:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch editors",
		});
	}
});

// @desc    Get single editor by ID
// @route   GET /api/editors/:id
// @access  Public
router.get("/:id", async (req, res) => {
	try {
		const editor = await Editor.findById(req.params.id).select("-adminNotes -__v");

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		res.status(200).json({
			success: true,
			data: editor,
		});
	} catch (error) {
		console.error("Error fetching editor:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch editor",
		});
	}
});

// @desc    Get editor portfolio
// @route   GET /api/editors/:id/portfolio
// @access  Public
router.get("/:id/portfolio", async (req, res) => {
	try {
		const editor = await Editor.findById(req.params.id)
			.select("portfolioLinks rating totalReviews completedProjects")
			.populate({
				path: "feedback",
				match: { isPublic: true, moderationStatus: "approved" },
				select: "rating comment createdAt",
				options: { sort: { createdAt: -1 }, limit: 10 },
			});

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				portfolioLinks: editor.portfolioLinks,
				rating: editor.rating,
				totalReviews: editor.totalReviews,
				completedProjects: editor.completedProjects,
				recentFeedback: editor.feedback,
			},
		});
	} catch (error) {
		console.error("Error fetching editor portfolio:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch editor portfolio",
		});
	}
});

// @desc    Create new editor (Admin only)
// @route   POST /api/editors
// @access  Private (Admin)
router.post(
	"/",
	[
		body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
		body("email").isEmail().withMessage("Valid email is required"),
		body("telegramUsername").trim().isLength({ min: 3 }).withMessage("Telegram username is required"),
		body("telegramId").trim().isLength({ min: 1 }).withMessage("Telegram ID is required"),
		body("bio").optional().isLength({ max: 1000 }).withMessage("Bio must be less than 1000 characters"),
		body("tags").optional().isArray().withMessage("Tags must be an array"),
		body("services").optional().isArray().withMessage("Services must be an array"),
		body("pricing").optional().isObject().withMessage("Pricing must be an object"),
	],
	async (req, res) => {
		try {
			// Check validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					error: errors.array()[0].msg,
				});
			}

			const {
				name,
				email,
				telegramUsername,
				telegramId,
				phone,
				bio,
				tags = [],
				services = [],
				badges = [],
				portfolioLinks = [],
				pricing = {},
			} = req.body;

			// Check if editor already exists
			const existingEditor = await Editor.findOne({
				$or: [{ email }, { telegramUsername }, { telegramId }],
			});

			if (existingEditor) {
				return res.status(400).json({
					success: false,
					error: "Editor with this email, Telegram username, or ID already exists",
				});
			}

			// Create new editor
			const editor = new Editor({
				name,
				email,
				telegramUsername,
				telegramId,
				phone,
				bio,
				tags,
				services,
				badges,
				portfolioLinks,
				pricing,
				status: "active",
				availability: true,
			});

			await editor.save();

			res.status(201).json({
				success: true,
				data: editor,
				message: "Editor created successfully",
			});
		} catch (error) {
			console.error("Error creating editor:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create editor",
			});
		}
	}
);

// @desc    Update editor (Admin only)
// @route   PUT /api/editors/:id
// @access  Private (Admin)
router.put("/:id", async (req, res) => {
	try {
		const editor = await Editor.findById(req.params.id);

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		// Update fields
		const updateFields = [
			"name",
			"email",
			"phone",
			"bio",
			"tags",
			"services",
			"badges",
			"portfolioLinks",
			"pricing",
			"status",
			"availability",
			"adminNotes",
		];

		updateFields.forEach((field) => {
			if (req.body[field] !== undefined) {
				editor[field] = req.body[field];
			}
		});

		await editor.save();

		res.status(200).json({
			success: true,
			data: editor,
			message: "Editor updated successfully",
		});
	} catch (error) {
		console.error("Error updating editor:", error);
		res.status(500).json({
			success: false,
			error: "Failed to update editor",
		});
	}
});

// @desc    Delete editor (Admin only)
// @route   DELETE /api/editors/:id
// @access  Private (Admin)
router.delete("/:id", async (req, res) => {
	try {
		const editor = await Editor.findById(req.params.id);

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		// Soft delete by setting status to inactive
		editor.status = "inactive";
		await editor.save();

		res.status(200).json({
			success: true,
			message: "Editor deactivated successfully",
		});
	} catch (error) {
		console.error("Error deleting editor:", error);
		res.status(500).json({
			success: false,
			error: "Failed to delete editor",
		});
	}
});

// @desc    Get editor statistics
// @route   GET /api/editors/:id/stats
// @access  Private (Admin)
router.get("/:id/stats", async (req, res) => {
	try {
		const editor = await Editor.findById(req.params.id)
			.select("rating totalReviews completedProjects createdAt")
			.populate({
				path: "feedback",
				select: "rating createdAt",
				options: { sort: { createdAt: -1 } },
			});

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		// Calculate statistics
		const totalEarnings = editor.completedProjects * 1000; // Placeholder calculation
		const averageRating = editor.rating || 0;
		const totalProjects = editor.completedProjects || 0;

		res.status(200).json({
			success: true,
			data: {
				totalEarnings,
				averageRating,
				totalProjects,
				totalReviews: editor.totalReviews,
				joinDate: editor.createdAt,
				recentFeedback: editor.feedback?.slice(0, 5) || [],
			},
		});
	} catch (error) {
		console.error("Error fetching editor stats:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch editor statistics",
		});
	}
});

export default router;
