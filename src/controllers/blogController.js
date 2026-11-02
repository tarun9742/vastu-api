import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import BlogPost from "../models/BlogPost.js";

export async function getPublicBlogPosts(req, res) {
  try {
    await connectDB();
    const slug = req.query.slug;

    if (slug) {
      const data = await BlogPost.findOne({
        slug,
        status: "published",
        publishedAt: { $lte: new Date() },
      }).lean();

      return data
        ? res.json({ success: true, data })
        : res.status(404).json({ success: false, error: "Post not found" });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const filter = {
      status: "published",
      $or: [{ publishedAt: null }, { publishedAt: { $lte: new Date() } }],
    };

    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch blog posts" });
  }
}

export async function getAdminBlogPosts(req, res) {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

    const [data, total] = await Promise.all([
      BlogPost.find({})
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch blog posts" });
  }
}

export async function createAdminBlogPost(req, res) {
  try {
    const b = req.body;
    if (!b.title?.trim() || !b.slug?.trim()) {
      return res.status(400).json({ success: false, error: "Title and slug are required" });
    }

    await connectDB();
    const data = await BlogPost.create(b);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    return res.status(e?.code === 11000 ? 409 : 500).json({
      success: false,
      error: e?.code === 11000 ? "Slug already exists" : "Unable to create blog post",
    });
  }
}

export async function updateAdminBlogPost(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid post id" });
    }

    const b = req.body;
    const allowed = [
      "title",
      "slug",
      "excerpt",
      "content",
      "coverImage",
      "author",
      "status",
      "publishedAt",
      "tags",
      "seo",
    ];
    const update = {};
    for (const k of allowed) {
      if (b[k] !== undefined) update[k] = b[k];
    }

    await connectDB();
    const data = await BlogPost.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    return data
      ? res.json({ success: true, data })
      : res.status(404).json({ success: false, error: "Post not found" });
  } catch (e) {
    return res.status(e?.code === 11000 ? 409 : 500).json({
      success: false,
      error: e?.code === 11000 ? "Slug already exists" : "Unable to update post",
    });
  }
}

export async function deleteAdminBlogPost(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid post id" });
    }

    await connectDB();
    const data = await BlogPost.findByIdAndDelete(id);

    return data
      ? res.json({ success: true })
      : res.status(404).json({ success: false, error: "Post not found" });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete post" });
  }
}
