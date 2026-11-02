import mongoose from "mongoose";
const CartItemSchema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, quantity: { type: Number, min: 1, default: 1 } }, { _id: false });
const CartSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true }, items: { type: [CartItemSchema], default: [] }, seedKey: { type: String, unique: true, sparse: true } }, { timestamps: true, versionKey: false });
export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
