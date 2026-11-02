import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import Service from "../models/Service.js";

const DEFAULT_SERVICES = [
  {
    name: "Residential Vastu",
    slug: "residential-vastu",
    description: "Create a harmonious and positive home environment with personalized directional energy balancing.",
    icon: "⌂",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85",
    price: 11000,
    features: [
      "Home Vastu Consultation",
      "Plan Analysis & Directional Corrections",
      "Remedies Without Demolition",
      "Online or In-Person Guidance",
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Commercial Vastu",
    slug: "commercial-vastu",
    description: "Enhance business growth, revenue stability, and team productivity with thoughtful workspace planning.",
    icon: "▥",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=85",
    price: 21000,
    features: [
      "Office, Showroom & Retail Vastu",
      "Cash Flow & Financial Corner Energizing",
      "Leadership Desk & Seating Alignment",
      "Practical Growth Corrections",
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Industrial Vastu",
    slug: "industrial-vastu",
    description: "Improve manufacturing layouts and space planning for factories, warehouses, and production facilities.",
    icon: "⚒",
    image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=800&q=85",
    price: 31000,
    features: [
      "Factory & Industrial Unit Vastu",
      "Heavy Machinery & Raw Material Orientation",
      "Boiler, Transformer & Energy Flow Balancing",
      "Safety and Operational Stability",
    ],
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Site Visit (On Location)",
    slug: "site-visit",
    description: "Comprehensive on-site physical inspection with live directional compass and geopathic stress assessment.",
    icon: "⌖",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=85",
    price: 25000,
    features: [
      "Detailed On-Ground Site Inspection",
      "Soil, Slope & Direction Verification",
      "Practical Space Correction Roadmap",
      "Applicable for Plots, Homes & Commercial",
    ],
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Vastu for Single Person",
    slug: "vastu-for-single-person",
    description: "Personalized astrological and spatial energy alignment focused exclusively on your bedroom, study, and aura.",
    icon: "👤",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85",
    price: 5100,
    features: [
      "Individual Energy & Aura Alignment",
      "Personal Bedroom & Study Desk Orientation",
      "Astrological Directional Boost",
      "Career, Exam & Peace of Mind Remedies",
    ],
    isActive: true,
    sortOrder: 5,
  },
];

async function ensureDefaultServices() {
  const count = await Service.countDocuments();
  if (count === 0) {
    console.log("Seeding initial 5 Vastu services...");
    await Service.insertMany(DEFAULT_SERVICES);
  }
}

export async function getServices(req, res) {
  try {
    await connectDB();
    await ensureDefaultServices();

    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.json({ success: true, data: services });
  } catch (error) {
    console.error("getServices error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch services" });
  }
}

export async function getAdminServices(req, res) {
  try {
    await connectDB();
    await ensureDefaultServices();

    const services = await Service.find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.json({ success: true, data: services });
  } catch (error) {
    console.error("getAdminServices error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch services" });
  }
}

export async function createAdminService(req, res) {
  try {
    await connectDB();
    const { name, description, icon, image, price, features, category, isActive, sortOrder } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: "Service name is required" });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await Service.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, error: "A service with this name or slug already exists" });
    }

    const service = await Service.create({
      name: name.trim(),
      slug,
      description: description || "",
      icon: icon || "⌂",
      image: image || "",
      price: Math.max(0, Number(price) || 0),
      features: Array.isArray(features) ? features : [],
      category: category || "Vastu Consultation",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("createAdminService error:", error);
    return res.status(500).json({ success: false, error: "Failed to create service" });
  }
}

export async function updateAdminService(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid service ID" });
    }

    await connectDB();
    const { name, description, icon, image, price, features, category, isActive, sortOrder } = req.body;

    const update = {};
    if (name !== undefined) {
      update.name = name.trim();
      update.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (description !== undefined) update.description = String(description);
    if (icon !== undefined) update.icon = String(icon);
    if (image !== undefined) update.image = String(image);
    if (price !== undefined) update.price = Math.max(0, Number(price) || 0);
    if (features !== undefined) update.features = Array.isArray(features) ? features : [];
    if (category !== undefined) update.category = String(category);
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    if (sortOrder !== undefined) update.sortOrder = Number(sortOrder) || 0;

    const service = await Service.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    return res.json({ success: true, data: service });
  } catch (error) {
    console.error("updateAdminService error:", error);
    return res.status(500).json({ success: false, error: "Failed to update service" });
  }
}

export async function deleteAdminService(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid service ID" });
    }

    await connectDB();
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    return res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("deleteAdminService error:", error);
    return res.status(500).json({ success: false, error: "Failed to delete service" });
  }
}
