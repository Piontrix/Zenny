import mongoose from "mongoose";

const editorSchema = new mongoose.Schema(
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
		status: {
			type: String,
			enum: ["active", "inactive", "suspended"],
			default: "active",
		},
		bio: {
			type: String,
			maxlength: 1000,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		badges: [
			{
				type: String,
				enum: ["verified", "premium", "fast_delivery", "quality", "popular"],
			},
		],
		portfolioLinks: [
			{
				type: String,
				trim: true,
			},
		],
		profilePicture: {
			type: String, // Cloudinary URL
		},
		coverImage: {
			type: String, // Cloudinary URL
		},
		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		totalReviews: {
			type: Number,
			default: 0,
		},
		completedProjects: {
			type: Number,
			default: 0,
		},
		services: [
			{
				type: String,
				enum: ["video_editing", "color_grading", "motion_graphics", "audio_editing", "subtitles"],
			},
		],
		pricing: {
			videoEditing: {
				type: Number,
				default: 0,
			},
			colorGrading: {
				type: Number,
				default: 0,
			},
			motionGraphics: {
				type: Number,
				default: 0,
			},
			audioEditing: {
				type: Number,
				default: 0,
			},
			subtitles: {
				type: Number,
				default: 0,
			},
		},
		availability: {
			type: Boolean,
			default: true,
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
		adminNotes: {
			type: String,
			maxlength: 1000,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
editorSchema.index({ email: 1 });
editorSchema.index({ telegramUsername: 1 });
editorSchema.index({ telegramId: 1 });
editorSchema.index({ status: 1 });
editorSchema.index({ tags: 1 });
editorSchema.index({ rating: -1 });
editorSchema.index({ completedProjects: -1 });

// Virtual for average rating calculation
editorSchema.virtual("averageRating").get(function () {
	return this.totalReviews > 0 ? this.rating / this.totalReviews : 0;
});

const Editor = mongoose.model("Editor", editorSchema);

export default Editor;
