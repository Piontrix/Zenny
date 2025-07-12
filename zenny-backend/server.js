import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import testRoutes from "./src/routes/test.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { protect } from "./src/middleware/auth.middleware.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
	res.send("Zenny Backend is running 🚀");
});

app.get("/me", protect, (req, res) => {
	res.json({ message: "You are authenticated!", user: req.user });
});

app.listen(PORT, () => {
	console.log(`✅ Server running on http://localhost:${PORT}`);
});
