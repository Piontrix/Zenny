import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "No token provided" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id).select("-password");
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		req.user = user; // Attach user to request
		next();
	} catch (err) {
		console.error(err);
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

// Role-based access control
export const allowRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden: Access denied" });
		}
		next();
	};
};
