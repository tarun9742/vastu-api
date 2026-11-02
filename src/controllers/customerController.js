import { connectDB } from "../lib/dbConnect.js";
import User from "../models/User.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAdminCustomers(req, res) {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const q = req.query.q?.trim();
    const filter = { role: "customer" };

    if (q) {
      filter.$or = [
        { phone: new RegExp(escapeRegex(q), "i") },
        { name: new RegExp(escapeRegex(q), "i") },
        { email: new RegExp(escapeRegex(q), "i") },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -otp -otpExpiresAt -otpAttempts")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch customers" });
  }
}

export async function updateAdminCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, city, state, address, status, notes } = req.body || {};

    await connectDB();
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (city !== undefined) update.city = city;
    if (state !== undefined) update.state = state;
    if (address !== undefined) update.address = address;
    if (status !== undefined) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const data = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).select("-passwordHash -otp -otpExpiresAt -otpAttempts").lean();

    if (!data) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to update customer" });
  }
}

export async function deleteAdminCustomer(req, res) {
  try {
    const { id } = req.params;
    await connectDB();
    const data = await User.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    return res.json({ success: true, message: "Customer deleted successfully" });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete customer" });
  }
}
