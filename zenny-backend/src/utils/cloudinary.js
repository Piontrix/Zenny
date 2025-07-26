import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isValidFilePath = (filePath) => {
	return path.isAbsolute(filePath) && !filePath.startsWith("data:");
};

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		if (isValidFilePath(localFilePath)) fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		if (isValidFilePath(localFilePath)) fs.unlinkSync(localFilePath);
		return null;
	}
};

export { uploadOnCloudinary };
