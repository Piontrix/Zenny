import express from "express";
import { adminLogin, registerCreator, verifyCreator } from "../controllers/auth.controller.js";

const router = express.Router();

// Admin Login
router.post("/admin/login", adminLogin);

// Creator Register & Verify
router.post("/creator/register", registerCreator);
router.post("/creator/verify", verifyCreator);

export default router;
