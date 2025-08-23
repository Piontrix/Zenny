import ChatRoom from "../models/ChatRoom.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import Reminder from "../models/Reminder.model.js";

// Helper to get the recipient in a chat
function getRecipientId(chatRoom, senderId) {
  if (chatRoom.creator.toString() === senderId.toString()) return chatRoom.editor;
  return chatRoom.creator;
}

export const initiateChat = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { editorId } = req.body;

    if (!editorId) {
      return res.status(400).json({ message: "Editor ID is required" });
    }

    // Check if editor exists
    const editor = await User.findOne({
      _id: editorId,
      role: "editor",
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });
    if (!editor) {
      return res.status(404).json({ message: "Editor not found" });
    }

    // Check if chat already exists
    let chatRoom = await ChatRoom.findOne({ creator: creatorId, editor: editorId });

    if (chatRoom) {
      return res.status(200).json({
        message: "Chat already exists",
        roomId: chatRoom._id,
        isNew: false,
        editor: {
          username: editor.username,
          _id: editor._id,
        },
      });
    }

    // Create new chat room
    chatRoom = await ChatRoom.create({
      creator: creatorId,
      editor: editorId,
    });

    res.status(201).json({
      message: "Chat initiated",
      roomId: chatRoom._id,
      isNew: true,
      editor: {
        username: editor.username,
        _id: editor._id,
      },
    });
  } catch (err) {
    console.error("Chat initiation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, content } = req.body;

    if (!chatRoomId || !content) {
      return res.status(400).json({ message: "ChatRoom ID and message content are required" });
    }
    // Prevent sharing of personal emails or phone numbers
    const blockedPatterns = [
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, // email
      /\b\d{10,}\b/g, // 10 or more digit numbers (likely phone numbers)
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(content)) {
        return res.status(400).json({
          message: "Sharing personal contact details (email/phone) is not allowed in chat.",
        });
      }
    }

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Prevent sending messages if chat is frozen or ended
    if (chatRoom.isEnded) {
      return res.status(403).json({ message: "Chat has completed or ended by admin" });
    }
    if (chatRoom.isFrozen) {
      return res.status(403).json({ message: "Chat is frozen by admin" });
    }

    // Make sure sender is part of the chat
    if (
      chatRoom.creator.toString() !== req.user._id.toString() &&
      chatRoom.editor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You are not a participant of this chat" });
    }

    // Save the message
    const message = await Message.create({
      chatRoom: chatRoomId,
      sender: req.user._id,
      content,
    });

    // Reminder logic (DB polling)
    const recipientId = getRecipientId(chatRoom, req.user._id);
    // Find the first unread message for this recipient in this chat
    const firstUnread = await Message.findOne({
      chatRoom: chatRoomId,
      sender: { $ne: recipientId },
      read: false,
    }).sort({ sentAt: 1 });
    if (firstUnread) {
      console.log("First unread message:", firstUnread._id);
      // Check if a reminder already exists and is not sent/cancelled
      const existingReminder = await Reminder.findOne({
        chatRoom: chatRoomId,
        recipient: recipientId,
        sent: false,
        cancelled: false,
      });
      if (!existingReminder) {
        console.log("Creating reminder for", recipientId, "in chat", chatRoomId);
        // Schedule a reminder for 1 minute from the first unread message
        await Reminder.create({
          chatRoom: chatRoomId,
          recipient: recipientId,
          firstUnreadMessage: firstUnread._id,
          scheduledFor: new Date(Date.now() + 20 * 60 * 1000),
        });
      } else {
        console.log("Reminder already exists for", recipientId, "in chat", chatRoomId);
      }
    } else {
      console.log("No unread message found for recipient", recipientId, "in chat", chatRoomId);
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        sentAt: message.sentAt,
        read: message.read,
      },
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel reminder utility (to be used in socket.js)
export async function cancelReminder(chatRoomId, recipientId) {
  await Reminder.updateMany(
    {
      chatRoom: chatRoomId,
      recipient: recipientId,
      sent: false,
      cancelled: false,
    },
    { $set: { cancelled: true } }
  );
}

export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }
    const isCreator = chatRoom.creator.toString() === req.user._id.toString();
    const isEditor = chatRoom.editor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isCreator && !isEditor && !isAdmin) {
      return res.status(403).json({ message: "Access denied to this chat" });
    }

    const messages = await Message.find({ chatRoom: roomId })
      .sort({ sentAt: 1 }) // oldest first
      .populate("sender", "username role");

    res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyChatRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let chatRooms;

    if (userRole === "creator") {
      chatRooms = await ChatRoom.find({ creator: userId }).populate("editor", "username email").sort({ updatedAt: -1 });
    } else if (userRole === "editor") {
      chatRooms = await ChatRoom.find({ editor: userId }).populate("creator", "username email").sort({ updatedAt: -1 });
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    res.status(200).json({
      message: "Chat rooms fetched",
      data: chatRooms,
    });
  } catch (err) {
    console.error("Get my chat rooms error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
