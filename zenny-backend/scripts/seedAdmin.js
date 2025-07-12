import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../src/models/User.model.js";
import connectDB from "../src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
	await connectDB();

	const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

	if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
		console.error("❌ ADMIN_USERNAME or ADMIN_PASSWORD missing in .env");
		process.exit(1);
	}

	const existingAdmin = await User.findOne({ role: "admin" });
	if (existingAdmin) {
		console.log("❗ Admin already exists. Skipping...");
		return process.exit(0);
	}

	const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

	const admin = await User.create({
		role: "admin",
		username: ADMIN_USERNAME,
		password: hashedPassword,
		isVerified: true,
	});

	console.log(`✅ Admin created: ${admin.username}`);
	process.exit(0);
};

seedAdmin();
