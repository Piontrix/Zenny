import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		telegramUsername: {
			type: String,
			required: true,
			unique: true,
		},
		telegramId: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		profilePicture: {
			type: String, // Cloudinary URL
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
		preferences: {
			notifications: {
				type: Boolean,
				default: true,
			},
			marketing: {
				type: Boolean,
				default: false,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
creatorSchema.index({ email: 1 });
creatorSchema.index({ telegramUsername: 1 });
creatorSchema.index({ telegramId: 1 });
creatorSchema.index({ isActive: 1 });

const Creator = mongoose.model("Creator", creatorSchema);

export default Creator;
