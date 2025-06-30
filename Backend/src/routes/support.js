import express from "express";
import { body, validationResult } from "express-validator";
import Support from "../../shared-db/collections/support.js";
import Dispute from "../../shared-db/collections/disputes.js";
import Session from "../../shared-db/collections/sessionModel.js";

const router = express.Router();

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Public
router.post(
	"/tickets",
	[
		body("subject").trim().isLength({ min: 5, max: 100 }).withMessage("Subject must be 5-100 characters"),
		body("message").trim().isLength({ min: 10, max: 1000 }).withMessage("Message must be 10-1000 characters"),
		body("category").isIn(["technical", "billing", "dispute", "general"]).withMessage("Invalid category"),
		body("priority").optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority"),
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
				subject,
				message,
				category,
				priority = "medium",
				creatorName,
				creatorEmail,
				creatorTelegramId,
				sessionId,
			} = req.body;

			// Create support ticket
			const ticket = new Support({
				subject,
				message,
				category,
				priority,
				creatorName,
				creatorEmail,
				creatorTelegramId,
				sessionId,
				status: "open",
			});

			await ticket.save();

			res.status(201).json({
				success: true,
				data: ticket,
				message: "Support ticket created successfully",
			});
		} catch (error) {
			console.error("Error creating support ticket:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create support ticket",
			});
		}
	}
);

// @desc    Get support tickets
// @route   GET /api/support/tickets
// @access  Private (Admin)
router.get("/tickets", async (req, res) => {
	try {
		const { page = 1, limit = 20, status, category, priority, search } = req.query;

		// Build filter
		const filter = {};
		if (status) filter.status = status;
		if (category) filter.category = category;
		if (priority) filter.priority = priority;
		if (search) {
			filter.$or = [
				{ subject: { $regex: search, $options: "i" } },
				{ message: { $regex: search, $options: "i" } },
				{ creatorName: { $regex: search, $options: "i" } },
			];
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get tickets
		const tickets = await Support.find(filter)
			.populate("sessionId", "groupTitle")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count
		const total = await Support.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: tickets,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching support tickets:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch support tickets",
		});
	}
});

// @desc    Get single support ticket
// @route   GET /api/support/tickets/:id
// @access  Private
router.get("/tickets/:id", async (req, res) => {
	try {
		const ticket = await Support.findById(req.params.id)
			.populate("sessionId", "groupTitle creatorId editorId")
			.populate("sessionId.creatorId", "name telegramUsername")
			.populate("sessionId.editorId", "name telegramUsername");

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: "Support ticket not found",
			});
		}

		res.status(200).json({
			success: true,
			data: ticket,
		});
	} catch (error) {
		console.error("Error fetching support ticket:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch support ticket",
		});
	}
});

// @desc    Update support ticket
// @route   PUT /api/support/tickets/:id
// @access  Private (Admin)
router.put("/tickets/:id", async (req, res) => {
	try {
		const { status, priority, adminResponse, assignedTo } = req.body;

		const ticket = await Support.findById(req.params.id);

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: "Support ticket not found",
			});
		}

		// Update fields
		if (status) ticket.status = status;
		if (priority) ticket.priority = priority;
		if (adminResponse) {
			ticket.adminResponse = adminResponse;
			ticket.respondedAt = new Date();
		}
		if (assignedTo) ticket.assignedTo = assignedTo;

		await ticket.save();

		res.status(200).json({
			success: true,
			data: ticket,
			message: "Support ticket updated successfully",
		});
	} catch (error) {
		console.error("Error updating support ticket:", error);
		res.status(500).json({
			success: false,
			error: "Failed to update support ticket",
		});
	}
});

// @desc    Create dispute
// @route   POST /api/support/disputes
// @access  Public
router.post(
	"/disputes",
	[
		body("sessionId").isMongoId().withMessage("Valid session ID is required"),
		body("reason").trim().isLength({ min: 10, max: 500 }).withMessage("Reason must be 10-500 characters"),
		body("disputeType").isIn(["payment", "quality", "communication", "other"]).withMessage("Invalid dispute type"),
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

			const { sessionId, reason, disputeType, evidence, creatorTelegramId } = req.body;

			// Check if session exists
			const session = await Session.findById(sessionId);
			if (!session) {
				return res.status(404).json({
					success: false,
					error: "Session not found",
				});
			}

			// Check if dispute already exists for this session
			const existingDispute = await Dispute.findOne({ sessionId });
			if (existingDispute) {
				return res.status(400).json({
					success: false,
					error: "Dispute already exists for this session",
				});
			}

			// Create dispute
			const dispute = new Dispute({
				sessionId: session._id,
				creatorId: session.creatorId,
				editorId: session.editorId,
				reason,
				disputeType,
				evidence,
				creatorTelegramId,
				status: "open",
			});

			await dispute.save();

			// Update session status
			session.status = "disputed";
			await session.save();

			res.status(201).json({
				success: true,
				data: dispute,
				message: "Dispute created successfully",
			});
		} catch (error) {
			console.error("Error creating dispute:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create dispute",
			});
		}
	}
);

// @desc    Get disputes
// @route   GET /api/support/disputes
// @access  Private (Admin)
router.get("/disputes", async (req, res) => {
	try {
		const { page = 1, limit = 20, status, disputeType, search } = req.query;

		// Build filter
		const filter = {};
		if (status) filter.status = status;
		if (disputeType) filter.disputeType = disputeType;
		if (search) {
			filter.$or = [{ reason: { $regex: search, $options: "i" } }, { evidence: { $regex: search, $options: "i" } }];
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get disputes
		const disputes = await Dispute.find(filter)
			.populate("sessionId", "groupTitle")
			.populate("creatorId", "name telegramUsername")
			.populate("editorId", "name telegramUsername")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count
		const total = await Dispute.countDocuments(filter);
		const totalPages = Math.ceil(total / parseInt(limit));

		res.status(200).json({
			success: true,
			data: disputes,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching disputes:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch disputes",
		});
	}
});

// @desc    Get single dispute
// @route   GET /api/support/disputes/:id
// @access  Private
router.get("/disputes/:id", async (req, res) => {
	try {
		const dispute = await Dispute.findById(req.params.id)
			.populate("sessionId", "groupTitle")
			.populate("creatorId", "name telegramUsername email")
			.populate("editorId", "name telegramUsername email");

		if (!dispute) {
			return res.status(404).json({
				success: false,
				error: "Dispute not found",
			});
		}

		res.status(200).json({
			success: true,
			data: dispute,
		});
	} catch (error) {
		console.error("Error fetching dispute:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch dispute",
		});
	}
});

// @desc    Resolve dispute
// @route   PUT /api/support/disputes/:id/resolve
// @access  Private (Admin)
router.put(
	"/disputes/:id/resolve",
	[
		body("resolution").trim().isLength({ min: 10, max: 1000 }).withMessage("Resolution must be 10-1000 characters"),
		body("outcome").isIn(["refund", "partial_refund", "no_action", "editor_penalty"]).withMessage("Invalid outcome"),
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

			const { resolution, outcome, refundAmount, adminNotes } = req.body;

			const dispute = await Dispute.findById(req.params.id);

			if (!dispute) {
				return res.status(404).json({
					success: false,
					error: "Dispute not found",
				});
			}

			if (dispute.status !== "open") {
				return res.status(400).json({
					success: false,
					error: "Dispute is already resolved",
				});
			}

			// Update dispute
			dispute.status = "resolved";
			dispute.resolution = resolution;
			dispute.outcome = outcome;
			dispute.refundAmount = refundAmount;
			dispute.adminNotes = adminNotes;
			dispute.resolvedAt = new Date();

			await dispute.save();

			// Update session status
			const session = await Session.findById(dispute.sessionId);
			if (session) {
				session.status = "resolved";
				await session.save();
			}

			res.status(200).json({
				success: true,
				data: dispute,
				message: "Dispute resolved successfully",
			});
		} catch (error) {
			console.error("Error resolving dispute:", error);
			res.status(500).json({
				success: false,
				error: "Failed to resolve dispute",
			});
		}
	}
);

// @desc    Get support statistics
// @route   GET /api/support/stats
// @access  Private (Admin)
router.get("/stats", async (req, res) => {
	try {
		const { startDate, endDate } = req.query;

		// Build date filter
		const dateFilter = {};
		if (startDate || endDate) {
			dateFilter.createdAt = {};
			if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
			if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
		}

		// Get ticket statistics
		const totalTickets = await Support.countDocuments(dateFilter);
		const openTickets = await Support.countDocuments({ ...dateFilter, status: "open" });
		const resolvedTickets = await Support.countDocuments({ ...dateFilter, status: "resolved" });

		// Get dispute statistics
		const totalDisputes = await Dispute.countDocuments(dateFilter);
		const openDisputes = await Dispute.countDocuments({ ...dateFilter, status: "open" });
		const resolvedDisputes = await Dispute.countDocuments({ ...dateFilter, status: "resolved" });

		// Get category breakdown
		const ticketCategories = await Support.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: "$category", count: { $sum: 1 } } },
		]);

		const disputeTypes = await Dispute.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: "$disputeType", count: { $sum: 1 } } },
		]);

		res.status(200).json({
			success: true,
			data: {
				tickets: {
					total: totalTickets,
					open: openTickets,
					resolved: resolvedTickets,
					categories: ticketCategories,
				},
				disputes: {
					total: totalDisputes,
					open: openDisputes,
					resolved: resolvedDisputes,
					types: disputeTypes,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching support statistics:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch support statistics",
		});
	}
});

export default router;
