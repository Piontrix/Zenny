import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.routes.js";
import { protect } from "./src/middleware/auth.middleware.js";
import { setupSocket } from "./socket.js"; // ✅ Import socket setup
import cookieParser from "cookie-parser";

// Env + DB
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // for Socket.io
const PORT = process.env.PORT || 4000;

// WebSocket
setupSocket(server); // ✅ plug in socket logic

// Middleware
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
	res.send("Zenny Backend is running 🚀");
});

app.get("/me", protect, (req, res) => {
	res.json({ message: "You are authenticated!", user: req.user });
});

// Start server
server.listen(PORT, () => {
	console.log(`✅ Server + WebSocket running at http://localhost:${PORT}`);
});
