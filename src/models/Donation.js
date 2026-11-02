import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    donorPhone: {
      type: String,
      required: true,
      index: true,
    },
    donorEmail: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    purpose: {
      type: String,
      default: "Choti Khushi NGO - Feeding Work for Birds",
    },
    pan: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
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
      index: true,
    },
    paymentReference: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);
