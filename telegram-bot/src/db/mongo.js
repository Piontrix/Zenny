import mongoose from "mongoose";
import { MONGO_URI } from "../config.js";

const connectMongo = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");
	} catch (err) {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	}
};

export default connectMongo;
