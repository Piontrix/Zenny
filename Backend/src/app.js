// src/app.js
import express from "express";
import cors from "cors";
import telegramRoutes from "./routes/telegram.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Zenny Telegram API ✅"));
app.get("/test", (req, res) => res.send("✅ Test route working"));

// Telegram webhook route
app.use("/webhook/telegram", telegramRoutes);

export default app;
