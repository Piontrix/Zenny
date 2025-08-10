import multer from "multer";

const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB) || 10; // default 10MB
const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB) || 100; // default 100MB

const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// Dynamic file size check inside fileFilter
const fileFilter = (req, file, cb) => {
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

	if (!allowedMimeTypes.includes(file.mimetype)) {
		return cb(new Error("Only image and video files are allowed!"), false);
	}

	// Check size limits dynamically
	if (file.mimetype.startsWith("image/") && file.size > MAX_IMAGE_SIZE_BYTES) {
		return cb(new Error(`Image exceeds ${MAX_IMAGE_SIZE_MB}MB limit`), false);
	}
	if (file.mimetype.startsWith("video/") && file.size > MAX_VIDEO_SIZE_BYTES) {
		return cb(new Error(`Video exceeds ${MAX_VIDEO_SIZE_MB}MB limit`), false);
	}

	cb(null, true);
};

const storage = multer.diskStorage({
	destination: "temp/",
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname);
	},
});

export const uploadMedia = multer({
	storage,
	limits: {
		fileSize: Math.max(MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES), // global cap
	},
	fileFilter,
});
