import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
	try {
		const token = req.cookies?.token;
		console.log(req.cookies);
		if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) return res.status(401).json({ message: "User not found" });

		req.user = user;
		next();
	} catch (err) {
		console.error("Auth error:", err);
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
