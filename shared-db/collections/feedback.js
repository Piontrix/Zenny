import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
	{
		sessionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Session",
			required: true,
		},
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Creator",
			required: true,
		},
		editorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Editor",
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			maxlength: 1000,
			trim: true,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		isModerated: {
			type: Boolean,
			default: false,
		},
		moderationStatus: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		adminNotes: {
			type: String,
			maxlength: 500,
		},
		aspects: {
			quality: {
				type: Number,
				min: 1,
				max: 5,
			},
			communication: {
				type: Number,
				min: 1,
				max: 5,
			},
			delivery: {
				type: Number,
				min: 1,
				max: 5,
			},
			value: {
				type: Number,
				min: 1,
				max: 5,
			},
		},
		helpful: {
			type: Number,
			default: 0,
		},
		reported: {
			type: Boolean,
			default: false,
		},
		reportReason: {
			type: String,
			maxlength: 500,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
feedbackSchema.index({ sessionId: 1 });
feedbackSchema.index({ creatorId: 1 });
feedbackSchema.index({ editorId: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ isPublic: 1 });
feedbackSchema.index({ moderationStatus: 1 });
feedbackSchema.index({ createdAt: -1 });

// Compound index for unique feedback per session
feedbackSchema.index({ sessionId: 1, creatorId: 1 }, { unique: true });

// Pre-save middleware to update editor rating
feedbackSchema.pre("save", async function (next) {
	if (this.isNew || this.isModified("rating")) {
		try {
			const Editor = mongoose.model("Editor");
			const editor = await Editor.findById(this.editorId);

			if (editor) {
				// Calculate new average rating
				const allFeedbacks = await mongoose.model("Feedback").find({
					editorId: this.editorId,
					isPublic: true,
					moderationStatus: "approved",
				});

				const totalRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
				const averageRating = allFeedbacks.length > 0 ? totalRating / allFeedbacks.length : 0;

				editor.rating = averageRating;
				editor.totalReviews = allFeedbacks.length;
				await editor.save();
			}
		} catch (error) {
			console.error("Error updating editor rating:", error);
		}
	}
	next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
