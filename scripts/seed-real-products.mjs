import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Product from "../src/models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Set it in your environment before running this destructive product seed.");
  process.exit(1);
}
if (process.env.CONFIRM_REPLACE_PRODUCTS !== "YES") {
  console.error("This seed deletes existing Product documents. Set CONFIRM_REPLACE_PRODUCTS=YES to confirm. Other collections are not deleted.");
  process.exit(1);
}
await mongoose.connect(uri);
try {
  const products = JSON.parse(await fs.readFile(path.join(__dirname, "../data/products.real.seed.json"), "utf8"));
  if (!Array.isArray(products) || products.length !== 62) throw new Error(`Expected 62 products; received ${products?.length}`);
  await Product.deleteMany({});
  const result = await Product.insertMany(products, { ordered: true });
  console.log(`Replaced product catalogue with ${result.length} products. Only Product documents were deleted; customers/orders/settings/content were not touched.`);
} finally {
  await mongoose.disconnect();
}
