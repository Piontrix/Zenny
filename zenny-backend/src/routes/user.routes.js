import express from "express";
import { getAllVerifiedEditors, getEditorById } from "../controllers/userController.js";

const router = express.Router();

router.get("/editors", getAllVerifiedEditors);
router.get("/editors/:editorId", getEditorById);

export default router;
