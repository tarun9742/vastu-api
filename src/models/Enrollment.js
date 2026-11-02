import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPhone: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: "",
    },
    userEmail: {
      type: String,
      default: "",
    },
    courseTitle: {
      type: String,
      required: true,
    },
    courseSlug: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
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
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed"],
      default: "pending",
      index: true,
    },
    paymentProvider: {
      type: String,
      default: "payu",
    },
    txnid: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentReference: {
      type: String,
      default: "",
    },
    whatsappLink: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true, versionKey: false }
);

EnrollmentSchema.index({ userPhone: 1, courseTitle: 1 });

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", EnrollmentSchema);
