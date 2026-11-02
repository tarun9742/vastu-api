import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import Ticket from "../models/Ticket.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createTicket(req, res) {
  try {
    const { name, phone, email, service, message } = req.body || {};

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required.",
      });
    }

    await connectDB();
    const ticketId = `TCK-${Date.now().toString().slice(-6)}`;

    const ticket = await Ticket.create({
      ticketId,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      service: service || "General Enquiry",
      message: (message || "").trim(),
      status: "New",
    });

    return res.status(201).json({
      success: true,
      ticketId,
      message: "Your query has been received. Our team will contact you shortly.",
      data: ticket,
    });
  } catch (error) {
    console.error("createTicket error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your enquiry. Please try again.",
    });
  }
}

export async function getMyTickets(req, res) {
  try {
    await connectDB();
    const rawPhone = String(req.query.phone || req.user?.phone || "").replace(/\D/g, "");
    const email = String(req.query.email || req.user?.email || "").trim().toLowerCase();

    const conditions = [];
    if (rawPhone.length >= 10) {
      conditions.push({ phone: { $regex: new RegExp(rawPhone.slice(-10) + "$") } });
    }
    if (email) {
      conditions.push({ email });
    }

    if (conditions.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = await Ticket.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getMyTickets error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch customer tickets" });
  }
}

export async function getAdminTickets(req, res) {
  try {
    await connectDB();
    const { status, q } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (q?.trim()) {
      const reg = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [
        { ticketId: reg },
        { name: reg },
        { phone: reg },
        { email: reg },
        { service: reg },
      ];
    }

    const data = await Ticket.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("getAdminTickets error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch tickets" });
  }
}

export async function updateAdminTicket(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid ticket id" });
    }

    const { status, notes } = req.body;
    const update = {};

    const allowed = ["New", "In Progress", "Contacted", "Resolved", "Closed"];
    if (status !== undefined) {
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status value" });
      }
      update.status = status;
    }

    if (notes !== undefined) {
      update.notes = String(notes);
    }

    await connectDB();
    const data = await Ticket.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!data) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error("updateAdminTicket error:", error);
    return res.status(500).json({ success: false, error: "Unable to update ticket" });
  }
}

export async function deleteAdminTicket(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid ticket id" });
    }

    await connectDB();
    const data = await Ticket.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("deleteAdminTicket error:", error);
    return res.status(500).json({ success: false, error: "Unable to delete ticket" });
  }
}
