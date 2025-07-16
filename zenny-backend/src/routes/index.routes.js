import express from "express";
import testRoutes from "./test.routes.js";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chat.routes.js";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/test", testRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/admin", adminRoutes);

export default router;
