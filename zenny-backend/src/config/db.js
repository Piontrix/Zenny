import mongoose from "mongoose";

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			dbName: process.env.MONGO_DB_NAME, // optional: force a db name
		});
		console.log(`✅ MongoDB connected: ${conn.connection.host}`);
	} catch (err) {
		console.error(`❌ MongoDB connection error: ${err.message}`);
		process.exit(1); // Exit with failure
	}
};

export default connectDB;
