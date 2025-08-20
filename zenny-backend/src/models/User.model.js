import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    reelCount: { type: Number, required: true },
    priceMin: { type: Number, required: true },
    priceMax: { type: Number }, // optional if there's only one price
  },
  { _id: false }
);

const sampleSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    tags: [{ type: String }],
    type: { type: String, enum: ["video", "image"], default: "video" },
  },
  { _id: false }
);

const editingTierSchema = new mongoose.Schema(
  {
    title: { type: String, enum: ["basic", "intermediate", "pro"], required: true },
    description: { type: String },
    features: [{ type: String }],
    pricing: [pricingSchema],
    samplesDriveLink: { type: String },
    samples: [sampleSchema], // cloudinary uploaded files
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    tiers: [editingTierSchema],
    whatsIncluded: [{ type: String }],
  },
  { _id: false }
);

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
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
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
    canResetPassword: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
    portfolio: {
      type: portfolioSchema,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.role !== "editor" && this.portfolio) {
    return next(new Error("Only editors can have portfolios"));
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
