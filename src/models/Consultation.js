import mongoose from "mongoose";

const ConsultationSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    documentNo: {
      type: String,
    },
    clientId: {
      type: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPhone: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherOrSpouseName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    residentialAddress: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    consultationMode: {
      type: String,
      enum: ["video_call", "office_visit", "site_visit"],
      default: "site_visit",
    },
    distanceTier: {
      type: String,
      enum: ["office_or_video", "within_jaipur", "within_200km", "within_200_300km", "above_300km"],
      default: "within_jaipur",
    },
    mode: {
      type: String,
      default: "in_person",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      default: "10:00 AM",
    },
    // Property Particulars (from PDF)
    propertyOwnerName: {
      type: String,
      trim: true,
    },
    propertyAddress: {
      type: String,
      trim: true,
    },
    propertyType: {
      type: String,
      default: "Residential",
    },
    approximateArea: {
      type: String,
      trim: true,
    },
    numberOfFloors: {
      type: String,
      trim: true,
    },
    propertyPlanProvided: {
      type: Boolean,
      default: false,
    },
    siteVisitRequired: {
      type: Boolean,
      default: true,
    },
    clientConcerns: {
      type: String,
    },
    // Family members / Health condition (from PDF Part I section 4)
    familyMembers: [
      {
        name: String,
        relationship: String,
        concern: String,
      },
    ],
    declarationAccepted: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentReference: {
      type: String,
    },
    txnid: {
      type: String,
      index: true,
    },
    address: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Consultation ||
  mongoose.model("Consultation", ConsultationSchema);
