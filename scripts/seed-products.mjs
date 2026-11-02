import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Product from "../src/models/Product.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Missing MONGODB_URI. Copy .env.example to .env.local and export variables before running the seed."); process.exit(1); }
await mongoose.connect(uri);
try {
 const products = JSON.parse(await fs.readFile(path.join(__dirname,"../data/products.seed.json"),"utf8"));
 let inserted=0, updated=0;
 for (const product of products) {
  const existing = await Product.findOne({ slug: product.slug }).select("_id createdAt");
  if (existing) {
   // Preserve admin edits on re-run; update only spreadsheet-imported source fields and image list.
   await Product.updateOne({ _id: existing._id }, { $set: { title: product.title, regularPrice: product.regularPrice, salePrice: product.salePrice, priceNeedsReview: product.priceNeedsReview, images: product.images, sku: product.sku } }); updated++;
  } else { await Product.create(product); inserted++; }
 }
 console.log(`Seed complete: ${products.length} products processed, ${inserted} inserted, ${updated} refreshed.`);
} finally { await mongoose.disconnect(); }
