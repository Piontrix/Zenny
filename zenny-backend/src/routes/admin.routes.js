import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import {
	getAllChatRooms,
	freezeChatRoom,
	endChatRoom,
	unfreezeChatRoom,
	unendChatRoom,
	getAllSupportTickets,
	updateSupportTicket,
} from "../controllers/admin.controller.js";
import multer from "multer";
import { updateEditorPortfolioStructure, uploadEditorPortfolioSamples } from "../controllers/editor.controller.js";

const router = express.Router();

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const upload = multer({
	dest: "temp/",
	limits: {
		fileSize: MAX_FILE_SIZE_BYTES,
	},
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
			"video/mp4",
			"video/quicktime",
			"video/x-matroska", // mkv
			"video/webm",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only image and video files are allowed!"), false);
		}
	},
});

router.use(protect, allowRoles("admin"));

router.get("/chat-rooms", getAllChatRooms);
router.patch("/chat/:roomId/freeze", freezeChatRoom);
router.patch("/chat/:roomId/end", endChatRoom);
router.patch("/chat/:roomId/unfreeze", unfreezeChatRoom);
router.patch("/chat/:roomId/unend", unendChatRoom);
router.patch("/editors/:editorId/portfolio/structure", updateEditorPortfolioStructure);

// Portfolio sample media upload (files + tags)
router.patch(
	"/editors/:editorId/portfolio/samples",
	(req, res, next) => {
		upload.any()(req, res, (err) => {
			if (err) {
				return res.status(400).json({ message: err.message });
			}
			next();
		});
	},
	uploadEditorPortfolioSamples
);

router.get("/support-tickets", protect, allowRoles("admin"), getAllSupportTickets);
router.patch("/support-tickets/:id", protect, allowRoles("admin"), updateSupportTicket);

export default router;
