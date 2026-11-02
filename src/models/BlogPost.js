import mongoose from "mongoose";
const BlogPostSchema = new mongoose.Schema({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, excerpt: String, content: { type: String, default: "" }, coverImage: String, author: String, status: { type: String, enum: ["draft","published","scheduled","archived"], default: "draft", index: true }, publishedAt: Date, tags: [String], seo: mongoose.Schema.Types.Mixed }, { timestamps: true, versionKey: false });
export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
