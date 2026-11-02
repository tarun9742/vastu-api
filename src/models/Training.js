import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    duration: { type: String, default: "" },
    format: {
      type: String,
      enum: ["online", "in_person", "hybrid"],
      default: "online",
    },
    level: { type: String, default: "Beginner" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    syllabus: { type: [String], default: [] },
    whatsappLink: { type: String, default: "" },
    seo: mongoose.Schema.Types.Mixed,
    seedKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Training ||
  mongoose.model("Training", TrainingSchema);
