import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; // Use promises API
import path from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to check if a file path is valid and local
const isValidFilePath = (filePath) => {
	return typeof filePath === "string" && path.isAbsolute(filePath) && !filePath.startsWith("data:");
};

const uploadOnCloudinary = async (localFilePath) => {
	if (!isValidFilePath(localFilePath)) {
		console.warn("❌ Invalid file path:", localFilePath);
		return null;
	}

	try {
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		await fs.unlink(localFilePath);

		return response;
	} catch (error) {
		console.error("❌ Cloudinary upload failed:", error);

		// Always try to clean up even if upload fails
		try {
			await fs.unlink(localFilePath);
		} catch (unlinkErr) {
			console.warn("⚠️ Failed to delete temp file after error:", unlinkErr.message);
		}

		return null;
	}
};

export { uploadOnCloudinary };
