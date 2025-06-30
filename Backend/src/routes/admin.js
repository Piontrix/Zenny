import express from "express";

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private
router.get("/dashboard", async (req, res) => {
	try {
		// TODO: Implement dashboard stats
		res.status(200).json({
			success: true,
			data: {
				totalEditors: 0,
				totalCreators: 0,
				totalSessions: 0,
				totalPayments: 0,
				recentActivity: [],
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
});

export default router;
