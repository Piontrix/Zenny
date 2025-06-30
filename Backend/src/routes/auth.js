import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";

const router = express.Router();

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
router.post(
	"/login",
	[body("email", "Please include a valid email").isEmail(), body("password", "Password is required").exists()],
	async (req, res) => {
		try {
			// Check for validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					error: errors.array()[0].msg,
				});
			}

			const { email, password } = req.body;

			// Check for user
			const user = await User.findOne({ email }).select("+password");

			if (!user) {
				return res.status(401).json({
					success: false,
					error: "Invalid credentials",
				});
			}

			// Check if user is active
			if (!user.isActive) {
				return res.status(401).json({
					success: false,
					error: "Account is deactivated",
				});
			}

			// Check if account is locked
			if (user.isLocked()) {
				return res.status(423).json({
					success: false,
					error: "Account is temporarily locked due to too many failed login attempts",
				});
			}

			// Check if password matches
			const isMatch = await user.matchPassword(password);

			if (!isMatch) {
				// Increment login attempts
				await user.incLoginAttempts();

				return res.status(401).json({
					success: false,
					error: "Invalid credentials",
				});
			}

			// Reset login attempts on successful login
			await user.resetLoginAttempts();

			// Update last login
			user.lastLogin = new Date();
			await user.save();

			// Create token
			const token = user.getSignedJwtToken();

			// Remove password from response
			user.password = undefined;

			res.status(200).json({
				success: true,
				token,
				user,
			});
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({
				success: false,
				error: "Server error",
			});
		}
	}
);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", async (req, res) => {
	try {
		// This route will be protected by auth middleware
		// req.user will be set by the middleware
		res.status(200).json({
			success: true,
			user: req.user,
		});
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
});

export default router;
