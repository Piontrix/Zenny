import express from "express";
import {
	adminLogin,
	registerCreator,
	verifyCreator,
	creatorLogin,
	registerEditor,
	editorLogin,
	logout,
} from "../controllers/auth.controller.js";
import { allowRoles, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin Login
router.post("/admin/login", adminLogin);

// Creator Register & Verify
router.post("/creator/register", protect, allowRoles("admin"), registerCreator);
router.post("/creator/verify", verifyCreator);
router.post("/creator/login", creatorLogin);
router.post("/admin/register-editor", protect, allowRoles("admin"), registerEditor);
router.post("/editor/login", editorLogin);
router.post("/logout", logout);
export default router;
