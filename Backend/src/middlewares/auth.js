import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
	try {
		let token;

		// Check for token in headers
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		// Check for token in cookies
		if (!token && req.cookies?.token) {
			token = req.cookies.token;
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}

		try {
			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get user from token
			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				return res.status(401).json({
					success: false,
					error: "User not found",
				});
			}

			// Check if user is admin
			if (user.type !== "admin") {
				return res.status(403).json({
					success: false,
					error: "Access denied. Admin privileges required.",
				});
			}

			req.user = user;
			next();
		} catch (error) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// Optional auth middleware for public routes that can work with or without auth
export const optionalAuth = async (req, res, next) => {
	try {
		let token;

		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token && req.cookies?.token) {
			token = req.cookies.token;
		}

		if (token) {
			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const user = await User.findById(decoded.id).select("-password");
				if (user) {
					req.user = user;
				}
			} catch (error) {
				// Token is invalid, but we don't throw error for optional auth
				console.log("Invalid token in optional auth:", error.message);
			}
		}

		next();
	} catch (error) {
		next();
	}
};
