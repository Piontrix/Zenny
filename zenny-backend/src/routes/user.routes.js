import express from "express";
import { getAllVerifiedEditors } from "../controllers/userController.js";

const router = express.Router();

router.get("/editors", getAllVerifiedEditors);

export default router;
