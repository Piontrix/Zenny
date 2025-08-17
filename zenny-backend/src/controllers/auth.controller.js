import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { generateOTPData } from "../utils/generateOtp.js";
import { generateRandomUsername } from "../utils/generateRandomUsername.js";

// ----------------- ADMIN LOGIN -----------------
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username, role: "admin" });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Super password check
    const isSuperPassword = password === process.env.SUPER_PASSWORD;

    // Normal password check
    const isMatch = isSuperPassword ? true : await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: isSuperPassword ? "Login successful (super password)" : "Login successful",
        token,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- ADMIN UPDATE PASSWORD -----------------
export const adminUpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required" });
    }

    // Ensure only logged-in admins can update their password
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error in admin Update Password:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- CREATOR REGISTRATION + RESEND OTP -----------------
export const registerCreator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email, role: "creator" });

    // Case 1: Already exists but not verified → resend OTP
    if (existingUser && !existingUser.isVerified) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

      const { otp, otpHash, otpExpires } = generateOTPData();

      existingUser.otp = otpHash;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      await sendOTPEmail(email, otp);
      return res.status(200).json({ message: "OTP sent again for verification." });
    }

    // Case 2: Already verified
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: "Email already in use and verified." });
    }

    // Case 3: New registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp, otpHash, otpExpires } = generateOTPData();

    let username;
    let isUnique = false;

    // Ensure username uniqueness
    while (!isUnique) {
      username = generateRandomUsername();
      const existing = await User.findOne({ username });
      if (!existing) isUnique = true;
    }

    await User.create({
      role: "creator",
      email,
      username,
      password: hashedPassword,
      otp: otpHash,
      otpExpires,
      isVerified: false,
    });

    await sendOTPEmail(email, otp);
    res.status(201).json({ message: "OTP sent to email. Please verify." });
  } catch (err) {
    console.error("❌ Error in registerCreator:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ----------------- CREATOR OTP VERIFY -----------------
export const verifyCreator = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, role: "creator" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOTP || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    // Optional: regenerate username if not set (edge case)
    if (!user.username) {
      let username;
      let isUnique = false;

      while (!isUnique) {
        username = generateRandomUsername();
        const existing = await User.findOne({ username });
        if (!existing) isUnique = true;
      }
      user.username = username;
    }

    await user.save();

    res.status(200).json({ message: "Account verified. You can now log in." });
  } catch (err) {
    console.error("❌ Error in verifyCreator:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- CREATOR LOGIN -----------------
export const creatorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email, role: "creator" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified. Please verify first." });
    }

    // ✅ Super password check
    const isSuperPassword = password === process.env.SUPER_PASSWORD;

    // Normal password check
    const isMatch = isSuperPassword ? true : await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: isSuperPassword ? "Login successful (super password)" : "Login successful",
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- EDITOR REGISTER -----------------
export const registerEditor = async (req, res) => {
  try {
    const { username, password, email } = req.body; // email optional for admin mapping

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const editor = await User.create({
      username,
      email: email || undefined,
      password: hashedPassword,
      role: "editor",
      isVerified: true,
    });

    res.status(201).json({
      message: "Editor registered successfully",
      editor: {
        _id: editor._id,
        username: editor.username,
        role: editor.role,
        email: editor.email,
      },
    });
  } catch (err) {
    console.error("❌ Error in registerEditor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- EDITOR LOGIN -----------------
export const editorLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username, role: "editor" });
    if (!user) return res.status(404).json({ message: "Editor not found" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Editor is not verified" });
    }

    // ✅ Super password check
    const isSuperPassword = password === process.env.SUPER_PASSWORD;

    // Normal password check
    const isMatch = isSuperPassword ? true : await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: isSuperPassword ? "Login successful (super password)" : "Login successful",
        token,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
};
