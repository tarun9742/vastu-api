import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerSnapshot: mongoose.Schema.Types.Mixed,
    items: { type: [mongoose.Schema.Types.Mixed], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon: { type: String, default: "" },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentType: {
      type: String,
      enum: ["full", "partial", "unpaid"],
      default: "full",
    },
    paymentHistory: [
      {
        amount: Number,
        method: String,
        date: { type: Date, default: Date.now },
        notes: String,
        reference: String,
      },
    ],
    currency: { type: String, default: "INR" },
    shippingAddress: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentProvider: String,
    paymentReference: String,
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
