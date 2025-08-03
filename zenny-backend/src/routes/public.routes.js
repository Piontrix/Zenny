import express from "express";
import { submitSupportTicket } from "../controllers/public.controller.js";
import { supportFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/support", supportFormLimiter, submitSupportTicket);

export default router;
