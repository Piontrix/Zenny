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
export const deleteFromCloudinary = async (fileUrl) => {
  try {
    // Extract public_id properly
    const url = new URL(fileUrl);
    const parts = url.pathname.split("/"); // e.g. [ '', 'your-cloud-name', 'image', 'upload', 'v12345', 'folder', 'file.jpg' ]

    // Remove the first 4 segments: /<cloud>/<resource_type>/upload/v12345/
    const publicIdWithExt = parts.slice(5).join("/"); // -> "folder/file.jpg"
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension

    // Detect resource type
    const resourceType = fileUrl.includes("/video/") ? "video" : "image";

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    if (result.result !== "ok") {
      console.warn("⚠️ Cloudinary delete response:", result);
    }
    return result;
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
  }
};

export { uploadOnCloudinary };
