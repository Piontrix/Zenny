import User from "../models/User.model.js";

export const getAllVerifiedEditors = async (req, res) => {
  try {
    const editors = await User.find({
      role: "editor",
      isVerified: true,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).select("_id username portfolio");
    res.status(200).json({ message: "Editors fetched", data: editors });
  } catch (err) {
    console.error("Get editors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEditorById = async (req, res) => {
  try {
    const { editorId } = req.params;

    const editor = await User.findOne({
      _id: editorId,
      role: "editor",
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).select("-password");
    if (!editor) {
      return res.status(404).json({ message: "Editor not found" });
    }

    res.status(200).json({
      message: "Editor fetched successfully",
      data: editor,
    });
  } catch (err) {
    console.error("Error fetching editor by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};
