import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ["admin", "editor", "creator"],
			required: true,
		},
		username: {
			type: String,
			unique: true,
			sparse: true, // allows null for creators
		},
		email: {
			type: String,
			unique: true,
			sparse: true, // allows null for editors/admins
		},
		password: {
			type: String,
			required: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isOnline: {
			type: Boolean,
			default: false,
		},
		otp: {
			type: String,
		},
		otpExpires: {
			type: Date,
		},
	},

	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
