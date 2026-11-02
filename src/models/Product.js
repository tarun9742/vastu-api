import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({ url: { type: String, required: true }, alt: { type: String, default: "" }, publicId: { type: String, default: null } }, { _id: false });
const ProductSchema = new mongoose.Schema({
 title: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true, index: true },
 description: { type: String, default: "" }, shortDescription: { type: String, default: "" }, category: { type: String, default: "Uncategorized", index: true }, sku: { type: String, unique: true, sparse: true },
 regularPrice: { type: Number, default: null, min: 0 }, salePrice: { type: Number, default: null, min: 0 }, currency: { type: String, default: "INR" }, priceNeedsReview: { type: Boolean, default: true },
 stock: { type: Number, default: 0, min: 0 }, stockStatus: { type: String, enum: ["in_stock", "out_of_stock", "backorder"], default: "out_of_stock" }, trackInventory: { type: Boolean, default: true },
 images: { type: [ImageSchema], default: [] }, status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true }, featured: { type: Boolean, default: false }, tags: { type: [String], default: [] }, specifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
 createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });
ProductSchema.index({ title: "text", description: "text", shortDescription: "text", tags: "text" });
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
