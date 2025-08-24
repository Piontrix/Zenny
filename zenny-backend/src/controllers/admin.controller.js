import { getIO } from "../../socket.js";
import ChatRoom from "../models/ChatRoom.model.js";
import { SupportTicket } from "../models/SupportTicket.model.js";
import User from "../models/User.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
// GET all chat rooms with creator/editor info
export const getAllChatRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find().populate("creator", "username email").populate("editor", "username email");
    // .sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Chat rooms fetched",
      data: rooms,
    });
  } catch (err) {
    console.error("Fetch chat rooms error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH freeze chat room
export const freezeChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chat = await ChatRoom.findByIdAndUpdate(roomId, { isFrozen: true }, { new: true });

    if (!chat) return res.status(404).json({ message: "Chat room not found" });
    getIO().to(roomId).emit("chatFrozen");
    res.status(200).json({ message: "Chat room frozen", data: chat });
  } catch (err) {
    console.error("Freeze chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH end chat room
export const endChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chat = await ChatRoom.findByIdAndUpdate(roomId, { isEnded: true }, { new: true });

    if (!chat) return res.status(404).json({ message: "Chat room not found" });
    getIO().to(roomId).emit("chatEnded");
    res.status(200).json({ message: "Chat room ended", data: chat });
  } catch (err) {
    console.error("End chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH unfreeze chat room
export const unfreezeChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chat = await ChatRoom.findByIdAndUpdate(roomId, { isFrozen: false }, { new: true });

    if (!chat) return res.status(404).json({ message: "Chat room not found" });

    getIO().to(roomId).emit("chatUnfrozen");

    res.status(200).json({ message: "Chat room unfrozen", data: chat });
  } catch (err) {
    console.error("Unfreeze chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH unend chat room
export const unendChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chat = await ChatRoom.findByIdAndUpdate(roomId, { isEnded: false }, { new: true });

    if (!chat) return res.status(404).json({ message: "Chat room not found" });

    getIO().to(roomId).emit("chatReopened");

    res.status(200).json({ message: "Chat room reopened", data: chat });
  } catch (err) {
    console.error("Unend chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

// Update ticket status or add internal note
export const updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNote } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (status) ticket.status = status;
    if (internalNote !== undefined) ticket.internalNote = internalNote;

    await ticket.save();

    res.json({ message: "Ticket updated", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update ticket." });
  }
};
export const deleteEditor = async (req, res) => {
  try {
    const { editorId } = req.params;

    const editor = await User.findOne({
      _id: editorId,
      role: "editor",
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });

    if (!editor) {
      return res.status(404).json({ message: "Editor not found" });
    }

    // 1. Delete all portfolio items from Cloudinary
    if (editor.portfolio?.tiers?.length) {
      for (const tier of editor.portfolio.tiers) {
        for (const sample of tier.samples || []) {
          try {
            await deleteFromCloudinary(sample.url);
          } catch (err) {
            console.error("⚠️ Failed to delete sample from Cloudinary:", err.message);
          }
        }
      }
    }

    // 2. Clear portfolio & soft delete
    if (!editor.portfolio) {
      editor.portfolio = { tiers: [] }; // ensure it's at least an object
    } else {
      editor.portfolio.tiers = [];
    }

    editor.isDeleted = true;

    await User.deleteOne({ _id: editorId });

    res.status(200).json({
      message: "Editor deleted permanently",
    });
  } catch (err) {
    console.error("❌ Error soft deleting editor:", err);
    res.status(500).json({ message: "Server error" });
  }
};
