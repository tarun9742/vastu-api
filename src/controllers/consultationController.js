import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import Consultation from "../models/Consultation.js";
import Service from "../models/Service.js";
import { generatePayUHash, getPayUEndpoint } from "../lib/payu.js";

const allowedStatuses = {
  status: ["pending", "confirmed", "completed", "cancelled"],
  paymentStatus: ["pending", "paid", "failed", "refunded"],
  mode: ["online", "in_person", "phone"],
};

export function calculateAppointmentFee({ consultationMode, distanceTier }) {
  if (consultationMode === "video_call" || consultationMode === "office_visit") {
    return 2100;
  }
  // Site Visit Location Tiers
  switch (distanceTier) {
    case "within_jaipur":
      return 11000;
    case "within_200km":
      return 21000;
    case "within_200_300km":
      return 31000;
    case "above_300km":
      return 51000;
    default:
      return 11000;
  }
}

export async function getConsultations(req, res) {
  try {
    await connectDB();
    const status = req.query.status;
    const filter = status ? { status } : {};
    const data = await Consultation.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch consultations" });
  }
}

export async function getMyConsultations(req, res) {
  try {
    await connectDB();
    const rawPhone = String(req.query.phone || req.user?.phone || "").replace(/\D/g, "");
    const email = String(req.query.email || req.user?.email || "").trim().toLowerCase();

    const conditions = [];
    if (rawPhone.length >= 10) {
      conditions.push({ phone: { $regex: new RegExp(rawPhone.slice(-10) + "$") } });
      conditions.push({ userPhone: { $regex: new RegExp(rawPhone.slice(-10) + "$") } });
    }
    if (email) {
      conditions.push({ email });
    }

    if (conditions.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = await Consultation.find({ $or: conditions })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getMyConsultations error:", error);
    return res.status(500).json({ success: false, error: "Unable to retrieve consultations" });
  }
}

export async function initiateAppointmentPayment(req, res) {
  try {
    await connectDB();
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");
    const email = String(body.email || "").trim().toLowerCase();
    const serviceName = String(body.service || "").trim();
    const serviceId = body.serviceId;
    const consultationMode = String(body.consultationMode || "site_visit");
    const distanceTier = String(body.distanceTier || "within_jaipur");
    const dateStr = String(body.date || "");
    const time = String(body.time || "10:00 AM");

    // Client and Reference details
    const reference = `BSV-APT-${Date.now().toString().slice(-8)}`;
    const documentNo = reference;
    const clientId = String(body.clientId || (phone ? `CLT-${phone.slice(-6)}` : `CLT-${Date.now().toString().slice(-6)}`));

    // PDF registration fields
    const fatherOrSpouseName = String(body.fatherOrSpouseName || "").trim();
    const residentialAddress = String(body.residentialAddress || body.address1 || "").trim();
    const occupation = String(body.occupation || "").trim();
    const propertyOwnerName = String(body.propertyOwnerName || name).trim();
    const propertyAddress = String(body.propertyAddress || body.address1 || "").trim();
    const propertyType = String(body.propertyType || "Residential");
    const approximateArea = String(body.approximateArea || "").trim();
    const numberOfFloors = String(body.numberOfFloors || "1").trim();
    const propertyPlanProvided = Boolean(body.propertyPlanProvided);
    const siteVisitRequired = consultationMode === "site_visit";
    const clientConcerns = String(body.clientConcerns || body.notes || "").trim();
    const familyMembers = Array.isArray(body.familyMembers) ? body.familyMembers : [];

    if (!name || phone.length < 10 || !email) {
      return res.status(400).json({
        success: false,
        error: "Valid full name, email, and 10-digit mobile number are required.",
      });
    }

    if (!serviceName) {
      return res.status(400).json({
        success: false,
        error: "Please select a consultation service.",
      });
    }

    // Exact fee calculation as required by user
    const fee = calculateAppointmentFee({ consultationMode, distanceTier });

    const requestedDate = new Date(`${dateStr}T12:00:00`);
    const dateVal = Number.isNaN(requestedDate.getTime()) ? new Date() : requestedDate;
    const txnid = `TXN_APT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const consultation = await Consultation.create({
      reference,
      documentNo,
      clientId,
      name,
      fatherOrSpouseName,
      email,
      phone,
      userPhone: phone,
      residentialAddress,
      occupation,
      type: serviceName,
      serviceId: mongoose.isValidObjectId(serviceId) ? serviceId : undefined,
      consultationMode,
      distanceTier,
      mode: consultationMode === "video_call" ? "online" : "in_person",
      date: dateVal,
      time,
      propertyOwnerName,
      propertyAddress,
      propertyType,
      approximateArea,
      numberOfFloors,
      propertyPlanProvided,
      siteVisitRequired,
      clientConcerns,
      familyMembers,
      declarationAccepted: true,
      address: propertyAddress || residentialAddress,
      notes: clientConcerns,
      amount: fee,
      status: "pending",
      paymentStatus: "pending",
      txnid,
    });

    const successUrl = process.env.PAYU_SUCCESS_URL || "http://localhost:3001/api/payments/payu/response";
    const failureUrl = process.env.PAYU_FAILURE_URL || "http://localhost:3001/api/payments/payu/response";

    const hash = generatePayUHash({
      txnid,
      amount: fee,
      productinfo: serviceName.substring(0, 50),
      firstname: name.split(" ")[0] || "Client",
      email,
      udf1: reference,
      udf2: "appointment",
      udf3: phone,
      udf4: "",
      udf5: "",
    });

    return res.json({
      success: true,
      reference,
      documentNo,
      clientId,
      appointmentId: consultation._id,
      amount: fee,
      payuData: {
        key: process.env.PAYU_KEY || "m6wAnh",
        txnid,
        amount: Number(fee).toFixed(2),
        productinfo: serviceName.substring(0, 50),
        firstname: name.split(" ")[0] || "Client",
        email,
        phone,
        surl: successUrl,
        furl: failureUrl,
        udf1: reference,
        udf2: "appointment",
        udf3: phone,
        udf4: "",
        udf5: "",
        hash,
        action: getPayUEndpoint(),
      },
    });
  } catch (error) {
    console.error("initiateAppointmentPayment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to initiate payment for appointment.",
    });
  }
}

export async function bookAppointment(req, res) {
  return initiateAppointmentPayment(req, res);
}

export async function createConsultation(req, res) {
  try {
    const b = req.body;
    if (!b.name?.trim() || !b.type || !b.date) {
      return res.status(400).json({
        success: false,
        error: "Name, consultation type and date are required",
      });
    }

    await connectDB();
    const reference = `BSV-APT-${Date.now().toString().slice(-8)}`;
    const phone = String(b.phone || "").replace(/\D/g, "");

    const data = await Consultation.create({
      reference,
      documentNo: reference,
      clientId: b.clientId || (phone ? `CLT-${phone.slice(-6)}` : "CLT-ADMIN"),
      name: b.name.trim(),
      email: String(b.email || "").toLowerCase(),
      phone: String(b.phone || ""),
      userPhone: phone,
      type: String(b.type),
      mode: ["online", "in_person", "phone"].includes(b.mode) ? b.mode : "online",
      date: new Date(b.date),
      time: String(b.time || "10:00 AM"),
      notes: String(b.notes || ""),
      amount: Math.max(0, Number(b.amount) || 0),
      status: b.status || "pending",
      paymentStatus: b.paymentStatus || "pending",
      address: String(b.address || ""),
      propertyAddress: String(b.propertyAddress || b.address || ""),
      propertyType: String(b.propertyType || "Residential"),
      clientConcerns: String(b.notes || ""),
    });

    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to create consultation" });
  }
}

export async function updateConsultation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid consultation id" });
    }

    const b = req.body;
    const update = {};

    for (const [key, values] of Object.entries(allowedStatuses)) {
      if (b[key] !== undefined) {
        if (!values.includes(b[key])) {
          return res.status(400).json({ success: false, error: `Invalid ${key}` });
        }
        update[key] = b[key];
      }
    }

    for (const key of [
      "name",
      "fatherOrSpouseName",
      "email",
      "phone",
      "residentialAddress",
      "occupation",
      "type",
      "time",
      "address",
      "propertyOwnerName",
      "propertyAddress",
      "propertyType",
      "approximateArea",
      "numberOfFloors",
      "clientConcerns",
      "notes",
    ]) {
      if (b[key] !== undefined) update[key] = String(b[key]);
    }

    if (b.propertyPlanProvided !== undefined) update.propertyPlanProvided = Boolean(b.propertyPlanProvided);
    if (b.phone) update.userPhone = String(b.phone).replace(/\D/g, "");

    if (b.date !== undefined) {
      const date = new Date(b.date);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid date" });
      }
      update.date = date;
    }

    if (b.amount !== undefined) {
      update.amount = Math.max(0, Number(b.amount) || 0);
    }

    await connectDB();
    const data = await Consultation.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!data) {
      return res.status(404).json({ success: false, error: "Consultation not found" });
    }

    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to update consultation" });
  }
}

export async function deleteConsultation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid consultation id" });
    }

    await connectDB();
    const data = await Consultation.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ success: false, error: "Consultation not found" });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete consultation" });
  }
}
