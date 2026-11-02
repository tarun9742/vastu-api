import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import Training from "../models/Training.js";

export async function getPublicTrainings(req, res) {
  try {
    await connectDB();
    const data = await Training.find({ status: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch training" });
  }
}

export async function getAdminTrainings(req, res) {
  try {
    await connectDB();
    const data = await Training.find({}).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch training" });
  }
}

export async function createAdminTraining(req, res) {
  try {
    const b = req.body;
    if (!b.title?.trim() || !b.slug?.trim()) {
      return res.status(400).json({ success: false, error: "Title and slug are required" });
    }

    await connectDB();
    const data = await Training.create(b);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    return res.status(e?.code === 11000 ? 409 : 500).json({
      success: false,
      error: e?.code === 11000 ? "Slug already exists" : "Unable to create training",
    });
  }
}

export async function updateAdminTraining(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid training id" });
    }

    const b = req.body;
    const keys = [
      "title",
      "slug",
      "description",
      "shortDescription",
      "coverImage",
      "price",
      "currency",
      "duration",
      "format",
      "level",
      "status",
      "featured",
      "syllabus",
      "whatsappLink",
      "seo",
    ];

    const update = {};
    for (const k of keys) {
      if (b[k] !== undefined) update[k] = b[k];
    }

    await connectDB();
    const data = await Training.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    return data
      ? res.json({ success: true, data })
      : res.status(404).json({ success: false, error: "Training not found" });
  } catch (e) {
    return res.status(e?.code === 11000 ? 409 : 500).json({
      success: false,
      error: e?.code === 11000 ? "Slug already exists" : "Unable to update training",
    });
  }
}

export async function deleteAdminTraining(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid training id" });
    }

    await connectDB();
    const data = await Training.findByIdAndDelete(id);

    return data
      ? res.json({ success: true })
      : res.status(404).json({ success: false, error: "Training not found" });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete training" });
  }
}
