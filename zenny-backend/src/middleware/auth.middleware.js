import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
	try {
		let token;

		// ✅ First: Check cookie
		if (req.cookies?.token) {
			token = req.cookies.token;
		}
		// ✅ Second: Check Bearer token
		else if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token) {
			return res.status(401).json({ message: "Not authorized, token missing" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({ message: "Not authorized, user not found" });
		}

		req.user = user;
		next();
	} catch (err) {
		console.error("Auth error:", err);
		return res.status(401).json({ message: "Not authorized, invalid token" });
	}
};
// Role-based access control
export const allowRoles = (...roles) => {
	return (req, res, next) => {
		console.log(roles, "AA");
		if (!roles.includes(req.user.role)) {
			console.log(req.user.role);
			return res.status(403).json({ message: "Forbidden: Access denied" });
		}
		next();
	};
};
