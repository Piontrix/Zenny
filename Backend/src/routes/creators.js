import express from "express";
import { body, validationResult } from "express-validator";
import Creator from "../../shared-db/collections/creators.js";
import Session from "../../shared-db/collections/sessionModel.js";
import { generateTelegramInviteLink } from "../services/telegramService.js";

const router = express.Router();

// @desc    Create creator account
// @route   POST /api/creators
// @access  Public
router.post(
	"/",
	[
		body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
		body("email").isEmail().withMessage("Valid email is required"),
		body("telegramUsername").trim().isLength({ min: 3 }).withMessage("Telegram username is required"),
		body("telegramId").trim().isLength({ min: 1 }).withMessage("Telegram ID is required"),
		body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
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

			const { name, email, telegramUsername, telegramId, phone } = req.body;

			// Check if creator already exists
			const existingCreator = await Creator.findOne({
				$or: [{ email }, { telegramUsername }, { telegramId }],
			});

			if (existingCreator) {
				return res.status(400).json({
					success: false,
					error: "Creator with this email, Telegram username, or ID already exists",
				});
			}

			// Create new creator
			const creator = new Creator({
				name,
				email,
				telegramUsername,
				telegramId,
				phone,
				isActive: true,
			});

			await creator.save();

			res.status(201).json({
				success: true,
				data: creator,
				message: "Creator account created successfully",
			});
		} catch (error) {
			console.error("Error creating creator:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create creator account",
			});
		}
	}
);

// @desc    Get creator profile
// @route   GET /api/creators/profile
// @access  Private (Creator)
router.get("/profile", async (req, res) => {
	try {
		// This would be protected by auth middleware
		// For now, we'll get creator by telegramId from query
		const { telegramId } = req.query;

		if (!telegramId) {
			return res.status(400).json({
				success: false,
				error: "Telegram ID is required",
			});
		}

		const creator = await Creator.findOne({ telegramId }).select("-__v");

		if (!creator) {
			return res.status(404).json({
				success: false,
				error: "Creator not found",
			});
		}

		res.status(200).json({
			success: true,
			data: creator,
		});
	} catch (error) {
		console.error("Error fetching creator profile:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch creator profile",
		});
	}
});

// @desc    Update creator profile
// @route   PUT /api/creators/profile
// @access  Private (Creator)
router.put("/profile", async (req, res) => {
	try {
		const { telegramId } = req.query;
		const { name, email, phone, preferences } = req.body;

		if (!telegramId) {
			return res.status(400).json({
				success: false,
				error: "Telegram ID is required",
			});
		}

		const creator = await Creator.findOne({ telegramId });

		if (!creator) {
			return res.status(404).json({
				success: false,
				error: "Creator not found",
			});
		}

		// Update fields
		if (name) creator.name = name;
		if (email) creator.email = email;
		if (phone) creator.phone = phone;
		if (preferences) creator.preferences = { ...creator.preferences, ...preferences };

		await creator.save();

		res.status(200).json({
			success: true,
			data: creator,
			message: "Profile updated successfully",
		});
	} catch (error) {
		console.error("Error updating creator profile:", error);
		res.status(500).json({
			success: false,
			error: "Failed to update creator profile",
		});
	}
});

// @desc    Get creator sessions
// @route   GET /api/creators/sessions
// @access  Private (Creator)
router.get("/sessions", async (req, res) => {
	try {
		const { telegramId } = req.query;
		const { page = 1, limit = 10, status } = req.query;

		if (!telegramId) {
			return res.status(400).json({
				success: false,
				error: "Telegram ID is required",
			});
		}

		const creator = await Creator.findOne({ telegramId });
		if (!creator) {
			return res.status(404).json({
				success: false,
				error: "Creator not found",
			});
		}

		// Build filter
		const filter = { creatorId: creator._id };
		if (status) filter.status = status;

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get sessions
		const sessions = await Session.find(filter)
			.populate("editorId", "name telegramUsername rating")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count
		const total = await Session.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: sessions,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching creator sessions:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch creator sessions",
		});
	}
});

// @desc    Create chat session with editor
// @route   POST /api/creators/chat
// @access  Public
router.post("/chat", async (req, res) => {
	try {
		const { creatorTelegramId, editorId, serviceType } = req.body;

		if (!creatorTelegramId || !editorId) {
			return res.status(400).json({
				success: false,
				error: "Creator Telegram ID and Editor ID are required",
			});
		}

		// Find creator and editor
		const creator = await Creator.findOne({ telegramId: creatorTelegramId });
		const editor = await Editor.findById(editorId);

		if (!creator) {
			return res.status(404).json({
				success: false,
				error: "Creator not found",
			});
		}

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		// Check if editor is available
		if (!editor.availability || editor.status !== "active") {
			return res.status(400).json({
				success: false,
				error: "Editor is not available at the moment",
			});
		}

		// Create Telegram group and get invite link
		const groupData = await generateTelegramInviteLink(creator, editor, serviceType);

		// Create session
		const session = new Session({
			creatorId: creator._id,
			editorId: editor._id,
			groupId: groupData.groupId,
			groupTitle: groupData.groupTitle,
			status: "active",
		});

		await session.save();

		res.status(201).json({
			success: true,
			data: {
				session,
				telegramInviteLink: groupData.inviteLink,
				editor: {
					name: editor.name,
					telegramUsername: editor.telegramUsername,
				},
			},
			message: "Chat session created successfully",
		});
	} catch (error) {
		console.error("Error creating chat session:", error);
		res.status(500).json({
			success: false,
			error: "Failed to create chat session",
		});
	}
});

// @desc    Get creator by Telegram ID
// @route   GET /api/creators/telegram/:telegramId
// @access  Public
router.get("/telegram/:telegramId", async (req, res) => {
	try {
		const creator = await Creator.findOne({ telegramId: req.params.telegramId }).select("-__v");

		if (!creator) {
			return res.status(404).json({
				success: false,
				error: "Creator not found",
			});
		}

		res.status(200).json({
			success: true,
			data: creator,
		});
	} catch (error) {
		console.error("Error fetching creator by Telegram ID:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch creator",
		});
	}
});

export default router;
