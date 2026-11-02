import fs from 'fs';
import { connectDB } from '../src/lib/dbConnect.js';
import Product from '../src/models/Product.js';

async function importProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connected to MongoDB.");

    const jsonPath = 'C:/Users/tsoni/Desktop/vastu/products_import.json';
    const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`Importing ${productsData.length} products...`);

    let inserted = 0;
    let updated = 0;

    for (const prod of productsData) {
      const existing = await Product.findOne({ slug: prod.slug });
      if (existing) {
        Object.assign(existing, prod);
        await existing.save();
        updated++;
      } else {
        await Product.create(prod);
        inserted++;
      }
    }

    console.log(`Import complete! Inserted: ${inserted}, Updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

importProducts();
