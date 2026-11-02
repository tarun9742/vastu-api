import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Set it in .env.local or export it before running the seed.");
  process.exit(1);
}

const names = [
  ["Aarav Sharma", "aarav.sharma"], ["Diya Patel", "diya.patel"],
  ["Rohan Mehta", "rohan.mehta"], ["Ananya Verma", "ananya.verma"],
  ["Vivaan Gupta", "vivaan.gupta"], ["Isha Joshi", "isha.joshi"],
  ["Arjun Singh", "arjun.singh"], ["Kavya Agarwal", "kavya.agarwal"],
  ["Aditya Jain", "aditya.jain"], ["Meera Shah", "meera.shah"]
];
const statuses = ["delivered", "shipped", "processing", "confirmed", "pending", "cancelled"];
const paymentStatuses = ["paid", "paid", "paid", "pending", "failed"];
const cityData = [
  ["Jaipur", "Rajasthan", "302001"], ["Ahmedabad", "Gujarat", "380001"],
  ["Pune", "Maharashtra", "411001"], ["Delhi", "Delhi", "110001"],
  ["Lucknow", "Uttar Pradesh", "226001"]
];

await mongoose.connect(uri);
try {
  const products = await Product.find({ status: { $ne: "archived" } }).lean();
  if (!products.length) {
    throw new Error("No products found. Run `npm run seed:products` first, then run this script again.");
  }
  const pricedProducts = products.filter(p => Number.isFinite(Number(p.salePrice ?? p.regularPrice)) && Number(p.salePrice ?? p.regularPrice) > 0);
  if (!pricedProducts.length) {
    throw new Error("No products have usable prices. Add valid prices to at least one product before seeding demo orders.");
  }

  const customers = [];
  for (let i = 0; i < names.length; i++) {
    const [name, handle] = names[i];
    const email = `${handle}@example.test`;
    const [city, state, postalCode] = cityData[i % cityData.length];
    const customer = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: {
        name, email, role: "customer", isActive: true,
        addresses: [{ label: "Home", name, line1: `${100 + i} Demo Road`, city, state, postalCode, country: "India", isDefault: true }]
      } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    customers.push(customer);
  }

  let inserted = 0;
  let refreshed = 0;
  for (let i = 0; i < 50; i++) {
    const customer = customers[i % customers.length];
    const productA = pricedProducts[(i * 3) % pricedProducts.length];
    const productB = pricedProducts[(i * 3 + 1) % pricedProducts.length];
    const count = i % 3 === 0 && pricedProducts.length > 1 ? 2 : 1;
    const chosen = count === 2 ? [productA, productB] : [productA];
    const items = chosen.map((p, idx) => {
      const price = Number(p.salePrice ?? p.regularPrice);
      const quantity = idx === 0 && i % 4 === 0 ? 2 : 1;
      return {
        product: p._id,
        productId: String(p._id),
        title: p.title,
        slug: p.slug,
        sku: p.sku ?? null,
        image: p.images?.[0]?.url ?? "",
        unitPrice: price,
        price,
        quantity,
        lineTotal: price * quantity
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = subtotal >= 1999 ? 0 : 99;
    const tax = 0;
    const total = subtotal + shipping + tax;
    const status = statuses[i % statuses.length];
    const paymentStatus = status === "cancelled" ? "failed" : paymentStatuses[i % paymentStatuses.length];
    const [city, state, postalCode] = cityData[i % cityData.length];
    const orderNumber = `DEMO-2026-${String(i + 1).padStart(4, "0")}`;
    const payload = {
      orderNumber,
      customer: customer._id,
      customerSnapshot: { name: customer.name, email: customer.email },
      items, subtotal, shipping, tax, total, currency: "INR",
      shippingAddress: { name: customer.name, line1: `${100 + (i % 10)} Demo Road`, city, state, postalCode, country: "India" },
      status, paymentStatus,
      paymentProvider: "demo-seed",
      paymentReference: `DEMO-PAY-${String(i + 1).padStart(5, "0")}`
    };
    const result = await Order.updateOne({ orderNumber }, { $setOnInsert: payload }, { upsert: true });
    if (result.upsertedCount) inserted++;
    else refreshed++;
  }

  console.log(`Demo seed complete: ${customers.length} customers available; 50 demo orders processed (${inserted} inserted, ${refreshed} already existed).`);
  console.log("Demo accounts use @example.test email addresses and are not real customer records.");
  console.log("Orders use paymentProvider=demo-seed. They do not represent real payments and must not be fulfilled as genuine orders.");
} finally {
  await mongoose.disconnect();
}
