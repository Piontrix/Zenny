import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			trim: true,
			maxlength: [50, "Name cannot be more than 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
			lowercase: true,
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		type: {
			type: String,
			enum: ["admin", "creator", "editor"],
			default: "admin",
		},
		role: {
			type: String,
			enum: ["super_admin", "admin", "moderator"],
			default: "admin",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockUntil: {
			type: Date,
		},
		profilePicture: {
			type: String,
		},
		permissions: [
			{
				type: String,
				enum: [
					"manage_editors",
					"manage_creators",
					"manage_payments",
					"manage_disputes",
					"manage_support",
					"view_analytics",
					"manage_settings",
				],
			},
		],
		preferences: {
			notifications: {
				email: {
					type: Boolean,
					default: true,
				},
				telegram: {
					type: Boolean,
					default: true,
				},
			},
			theme: {
				type: String,
				enum: ["light", "dark"],
				default: "light",
			},
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ type: 1 });
userSchema.index({ isActive: 1 });

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "30d",
	});
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
	return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
	// If we have a previous lock that has expired, restart at 1
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.updateOne({
			$unset: { lockUntil: 1 },
			$set: { loginAttempts: 1 },
		});
	}

	const updates = { $inc: { loginAttempts: 1 } };

	// Lock account after 5 failed attempts
	if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
		updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
	}

	return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
	return this.updateOne({
		$unset: { loginAttempts: 1, lockUntil: 1 },
	});
};

const User = mongoose.model("User", userSchema);

export default User;
