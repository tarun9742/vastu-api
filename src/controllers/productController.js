import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "../lib/dbConnect.js";
import Product from "../models/Product.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const productCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  regularPrice: z.number().nonnegative().nullable().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  priceNeedsReview: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        publicId: z.string().nullable().optional(),
      })
    )
    .optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
});

const productUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    category: z.string().optional(),
    sku: z.string().optional(),
    regularPrice: z.number().nonnegative().nullable().optional(),
    salePrice: z.number().nonnegative().nullable().optional(),
    priceNeedsReview: z.boolean().optional(),
    stock: z.number().int().nonnegative().optional(),
    stockStatus: z.enum(["in_stock", "out_of_stock", "backorder"]).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional(),
          publicId: z.string().nullable().optional(),
        })
      )
      .optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    specifications: z.array(z.unknown()).optional(),
  })
  .strict();

export async function getProducts(req, res) {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 12)));
    const q = req.query.q?.trim();
    const category = req.query.category;

    const filter = {
      status: "published",
      priceNeedsReview: false,
      regularPrice: { $ne: null },
    };

    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch products" });
  }
}

export async function getProductBySlug(req, res) {
  try {
    await connectDB();
    const { slug } = req.params;
    const product = await Product.findOne({
      slug,
      status: "published",
      priceNeedsReview: false,
      regularPrice: { $ne: null },
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, data: product });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch product" });
  }
}

export async function getAdminProducts(req, res) {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const q = req.query.q?.trim();
    const filter = {};

    if (q) {
      filter.$or = [
        { title: new RegExp(escapeRegex(q), "i") },
        { sku: new RegExp(escapeRegex(q), "i") },
      ];
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const data = items.map((p) => ({
      ...p,
      name: p.title || p.name,
      price: p.regularPrice ?? p.price ?? 0,
      compareAtPrice: p.salePrice ?? p.compareAtPrice ?? 0,
      stock: p.stock ?? p.stockQuantity ?? 0,
      image: Array.isArray(p.images) && p.images.length > 0 ? (p.images[0]?.url || p.images[0]) : (p.image || ""),
      images: Array.isArray(p.images) ? p.images : [],
    }));

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch products" });
  }
}

function normalizeProductInput(raw) {
  const data = { ...raw };
  if (data.name && !data.title) data.title = data.name;
  if (!data.slug && data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (data.price !== undefined && data.regularPrice === undefined) {
    data.regularPrice = Number(data.price);
  }
  if (data.compareAtPrice !== undefined && data.salePrice === undefined) {
    data.salePrice = Number(data.compareAtPrice) || null;
  }
  if (data.stockQuantity !== undefined && data.stock === undefined) {
    data.stock = Number(data.stockQuantity);
  }
  if (data.status) {
    const s = String(data.status).toLowerCase();
    data.status = (s === "active" || s === "published") ? "published" : "draft";
  }
  data.priceNeedsReview = false;

  if (Array.isArray(data.images)) {
    data.images = data.images.map((img) => {
      if (typeof img === "string") {
        return { url: img, alt: data.title || "", publicId: null };
      }
      if (img && typeof img === "object" && img.url) {
        return {
          url: img.url,
          alt: img.alt || data.title || "",
          publicId: img.publicId || null,
        };
      }
      return null;
    }).filter(Boolean);
  }
  return data;
}

export async function createAdminProduct(req, res) {
  try {
    const normalized = normalizeProductInput(req.body);
    const body = productCreateSchema.parse(normalized);
    await connectDB();
    const product = await Product.create(body);
    return res.status(201).json({ success: true, data: product });
  } catch (e) {
    return res.status(e?.issues ? 400 : e?.code === 11000 ? 409 : 500).json({
      success: false,
      error:
        e?.issues?.[0]?.message ||
        (e?.code === 11000 ? "Slug or SKU already exists" : "Unable to create product"),
    });
  }
}

export async function updateAdminProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid product id" });
    }

    const normalized = normalizeProductInput(req.body);
    const body = productUpdateSchema.parse(normalized);
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, data: product });
  } catch (e) {
    return res.status(e?.issues ? 400 : e?.code === 11000 ? 409 : 500).json({
      success: false,
      error:
        e?.issues?.[0]?.message ||
        (e?.code === 11000 ? "Slug or SKU already exists" : "Unable to update product"),
    });
  }
}

export async function deleteAdminProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid product id" });
    }

    await connectDB();
    const item = await Product.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, message: "Product deleted" });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete product" });
  }
}
