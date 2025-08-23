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
    if (!fileUrl) return;

    const url = new URL(fileUrl);
    const parts = url.pathname.split("/");

    // Find index of "upload"
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) {
      console.warn("⚠️ Invalid Cloudinary URL, no 'upload' found:", fileUrl);
      return;
    }

    // Everything after "upload/"
    let publicIdParts = parts.slice(uploadIndex + 1);

    // If first part is version (e.g. v12345), remove it
    if (/^v[0-9]+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    // Join remaining as public_id
    const publicIdWithExt = publicIdParts.join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension

    // Detect resource type from URL
    const resourceType = fileUrl.includes("/video/") ? "video" : "image";

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    if (result.result !== "ok") {
      console.warn("⚠️ Cloudinary delete response:", result, "for", fileUrl, "with public_id:", publicId);
    }

    return result;
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
  }
};

export { uploadOnCloudinary };
