import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";

import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.routes.js";
import { protect } from "./src/middleware/auth.middleware.js";
import { setupSocket } from "./socket.js"; // ✅ Import socket setup
import cookieParser from "cookie-parser";
import { handleCashfreeWebhook } from "./src/controllers/payment.controller.js";

// Env + DB
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

// app.post("/api/payment/webhook", express.raw({ type: "application/json" }), handleCashfreeWebhook);
app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf.toString(); // store raw body as string
		},
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
