import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    service: { type: String, default: "General Enquiry" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["New", "In Progress", "Contacted", "Resolved", "Closed"],
      default: "New",
      index: true,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
