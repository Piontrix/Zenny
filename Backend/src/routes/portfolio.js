import express from "express";
import { body, validationResult } from "express-validator";
import Editor from "../../shared-db/collections/editors.js";
import Feedback from "../../shared-db/collections/feedback.js";

const router = express.Router();

// @desc    Get portfolio stats
// @route   GET /api/portfolio/stats
// @access  Public
router.get("/stats", async (req, res) => {
	try {
		// TODO: Implement portfolio statistics
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
});

// @desc    Get editor portfolio with feedback
// @route   GET /api/portfolio/:editorId
// @access  Public
router.get("/:editorId", async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;

		const editor = await Editor.findById(req.params.editorId)
			.select("name bio tags services badges portfolioLinks rating totalReviews completedProjects")
			.populate({
				path: "feedback",
				match: { isPublic: true, moderationStatus: "approved" },
				select: "rating comment createdAt creatorName",
				options: { sort: { createdAt: -1 }, skip: (parseInt(page) - 1) * parseInt(limit), limit: parseInt(limit) },
			});

		if (!editor) {
			return res.status(404).json({
				success: false,
				error: "Editor not found",
			});
		}

		// Get total feedback count for pagination
		const totalFeedback = await Feedback.countDocuments({
			editorId: editor._id,
			isPublic: true,
			moderationStatus: "approved",
		});

		const totalPages = Math.ceil(totalFeedback / parseInt(limit));

		res.status(200).json({
			success: true,
			data: {
				editor: {
					name: editor.name,
					bio: editor.bio,
					tags: editor.tags,
					services: editor.services,
					badges: editor.badges,
					portfolioLinks: editor.portfolioLinks,
					rating: editor.rating,
					totalReviews: editor.totalReviews,
					completedProjects: editor.completedProjects,
				},
				feedback: editor.feedback,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total: totalFeedback,
					totalPages,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching portfolio:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch portfolio",
		});
	}
});

// @desc    Submit feedback for editor
// @route   POST /api/portfolio/:editorId/feedback
// @access  Public
router.post(
	"/:editorId/feedback",
	[
		body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
		body("comment").trim().isLength({ min: 10, max: 500 }).withMessage("Comment must be 10-500 characters"),
		body("creatorName").trim().isLength({ min: 2, max: 50 }).withMessage("Creator name must be 2-50 characters"),
		body("sessionId").isMongoId().withMessage("Valid session ID is required"),
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

			const { rating, comment, creatorName, sessionId, isPublic = true } = req.body;
			const editorId = req.params.editorId;

			// Check if editor exists
			const editor = await Editor.findById(editorId);
			if (!editor) {
				return res.status(404).json({
					success: false,
					error: "Editor not found",
				});
			}

			// Create feedback
			const feedback = new Feedback({
				editorId: editor._id,
				sessionId,
				creatorName,
				rating: parseInt(rating),
				comment,
				isPublic,
				moderationStatus: "pending",
			});

			await feedback.save();

			// Update editor rating (only if feedback is public and approved)
			if (isPublic) {
				const allFeedback = await Feedback.find({
					editorId: editor._id,
					isPublic: true,
					moderationStatus: "approved",
				});

				const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
				const averageRating = totalRating / allFeedback.length;

				editor.rating = averageRating;
				editor.totalReviews = allFeedback.length;
				await editor.save();
			}

			res.status(201).json({
				success: true,
				data: feedback,
				message: "Feedback submitted successfully",
			});
		} catch (error) {
			console.error("Error submitting feedback:", error);
			res.status(500).json({
				success: false,
				error: "Failed to submit feedback",
			});
		}
	}
);

// @desc    Get feedback by session
// @route   GET /api/portfolio/feedback/session/:sessionId
// @access  Private
router.get("/feedback/session/:sessionId", async (req, res) => {
	try {
		const feedback = await Feedback.findOne({ sessionId: req.params.sessionId });

		if (!feedback) {
			return res.status(404).json({
				success: false,
				error: "Feedback not found",
			});
		}

		res.status(200).json({
			success: true,
			data: feedback,
		});
	} catch (error) {
		console.error("Error fetching session feedback:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch feedback",
		});
	}
});

// @desc    Update feedback
// @route   PUT /api/portfolio/feedback/:feedbackId
// @access  Private
router.put("/feedback/:feedbackId", async (req, res) => {
	try {
		const { rating, comment, isPublic } = req.body;

		const feedback = await Feedback.findById(req.params.feedbackId);

		if (!feedback) {
			return res.status(404).json({
				success: false,
				error: "Feedback not found",
			});
		}

		// Update fields
		if (rating !== undefined) feedback.rating = parseInt(rating);
		if (comment !== undefined) feedback.comment = comment;
		if (isPublic !== undefined) feedback.isPublic = isPublic;

		await feedback.save();

		// Update editor rating if needed
		if (feedback.isPublic && feedback.moderationStatus === "approved") {
			const editor = await Editor.findById(feedback.editorId);
			if (editor) {
				const allFeedback = await Feedback.find({
					editorId: editor._id,
					isPublic: true,
					moderationStatus: "approved",
				});

				const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
				const averageRating = totalRating / allFeedback.length;

				editor.rating = averageRating;
				editor.totalReviews = allFeedback.length;
				await editor.save();
			}
		}

		res.status(200).json({
			success: true,
			data: feedback,
			message: "Feedback updated successfully",
		});
	} catch (error) {
		console.error("Error updating feedback:", error);
		res.status(500).json({
			success: false,
			error: "Failed to update feedback",
		});
	}
});

// @desc    Moderate feedback (Admin only)
// @route   PUT /api/portfolio/feedback/:feedbackId/moderate
// @access  Private (Admin)
router.put("/feedback/:feedbackId/moderate", async (req, res) => {
	try {
		const { moderationStatus, adminNotes } = req.body;

		if (!["pending", "approved", "rejected"].includes(moderationStatus)) {
			return res.status(400).json({
				success: false,
				error: "Invalid moderation status",
			});
		}

		const feedback = await Feedback.findById(req.params.feedbackId);

		if (!feedback) {
			return res.status(404).json({
				success: false,
				error: "Feedback not found",
			});
		}

		feedback.moderationStatus = moderationStatus;
		if (adminNotes) feedback.adminNotes = adminNotes;

		await feedback.save();

		// Update editor rating if moderation status changed
		if (feedback.isPublic) {
			const editor = await Editor.findById(feedback.editorId);
			if (editor) {
				const allFeedback = await Feedback.find({
					editorId: editor._id,
					isPublic: true,
					moderationStatus: "approved",
				});

				const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
				const averageRating = allFeedback.length > 0 ? totalRating / allFeedback.length : 0;

				editor.rating = averageRating;
				editor.totalReviews = allFeedback.length;
				await editor.save();
			}
		}

		res.status(200).json({
			success: true,
			data: feedback,
			message: "Feedback moderated successfully",
		});
	} catch (error) {
		console.error("Error moderating feedback:", error);
		res.status(500).json({
			success: false,
			error: "Failed to moderate feedback",
		});
	}
});

// @desc    Get pending feedback for moderation
// @route   GET /api/portfolio/feedback/pending
// @access  Private (Admin)
router.get("/feedback/pending", async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const feedback = await Feedback.find({ moderationStatus: "pending" })
			.populate("editorId", "name telegramUsername")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Feedback.countDocuments({ moderationStatus: "pending" });
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: feedback,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching pending feedback:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch pending feedback",
		});
	}
});

export default router;
