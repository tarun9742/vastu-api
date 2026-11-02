import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import mongoose from "mongoose";
import StoreSettings from "../src/models/StoreSettings.js";
import BlogPost from "../src/models/BlogPost.js";
import Consultation from "../src/models/Consultation.js";
import Training from "../src/models/Training.js";
import Cart from "../src/models/Cart.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Missing MONGODB_URI. Put it in .env.local or .env before seeding."); process.exit(1); }
const now = new Date();
const daysFromNow = (days) => new Date(now.getTime() + days * 86400000);

const settings = {
  key: "main",
  general: {
    storeName: "Bhuwneshwari Scientific Vastu",
    legalName: "Bhuwneshwari Scientific Vastu",
    tagline: "Bring balance and harmony to your spaces",
    supportEmail: "support@example.com",
    supportPhone: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    country: "IN",
    address: { line1: "", line2: "", city: "", state: "Rajasthan", postalCode: "", country: "India" },
    announcementEnabled: false,
    announcementText: "",
    contactWhatsapp: ""
  },
  maintenance: { enabled: false, message: "We are improving our store. Please check back soon.", allowAdminAccess: true, estimatedReturn: "" },
  appearance: { logoUrl: "", faviconUrl: "", primaryColor: "#B68A3A", secondaryColor: "#3A2B20", backgroundColor: "#FAF7F0", fontFamily: "inherit", showAnnouncementBar: false, showFloatingBookNow: true, homepageHeroTitle: "Bring Harmony Into Your Home", homepageHeroSubtitle: "Discover thoughtful Vastu products and expert guidance for balanced living.", homepageHeroImage: "", homepageHeroCtaText: "Explore Products", homepageHeroCtaUrl: "/products" },
  payments: { mode: "test", codEnabled: true, onlinePaymentsEnabled: false, provider: "razorpay", currency: "INR", paymentInstructions: "Online payment will be available soon.", razorpayKeyId: "", stripePublishableKey: "" },
  shipping: { freeShippingThreshold: 1999, flatRate: 99, estimatedMinDays: 3, estimatedMaxDays: 7, shippingCountries: ["IN"], returnWindowDays: 7, returnPolicy: "Contact support to request a return. Eligibility is subject to review." },
  inventory: { lowStockThreshold: 5, allowBackorders: false, hideOutOfStock: false, reserveStockMinutes: 15, defaultStock: 0 },
  consultations: { enabled: true, bookingLeadHours: 24, defaultDurationMinutes: 45, defaultPrice: 1499, currency: "INR", modes: ["online", "phone", "in_person"], cancellationHours: 24, confirmationMessage: "Thank you. Your consultation request has been received." },
  training: { enabled: true, showOnNavigation: true, enquiryEmail: "support@example.com", defaultCurrency: "INR" },
  blog: { enabled: true, postsPerPage: 9, showAuthor: true, showPublishedDate: true, defaultAuthor: "Bhuwneshwari Scientific Vastu", defaultCategory: "Vastu Guidance" },
  seo: { siteTitle: "Bhuwneshwari Scientific Vastu | Vastu Products & Consultation", titleTemplate: "%s | Bhuwneshwari Scientific Vastu", defaultDescription: "Explore Vastu products, practical guidance and personalized Vastu consultation.", defaultKeywords: ["Vastu", "Vastu products", "Vastu consultation", "Vastu Shastra"], canonicalBaseUrl: "", robotsIndex: true, robotsFollow: true, defaultOgImage: "", twitterHandle: "" },
  notifications: { orderEmailEnabled: false, consultationEmailEnabled: false, adminEmail: "support@example.com", customerOrderUpdates: true, lowStockAlerts: true, smsEnabled: false, whatsappEnabled: false },
  security: { customerRegistrationEnabled: true, requireVerifiedPhone: true, maxLoginAttempts: 5, sessionDurationDays: 7, adminMobile: process.env.ADMIN_MOBILE || "8690708302", maintenanceAdminBypass: true }
};

const blogs = [
  { title: "Vastu Shastra for Beginners: A Practical Starting Guide", slug: "vastu-shastra-for-beginners", excerpt: "Understand the basic ideas behind Vastu and start with practical observations of your home.", content: `# Vastu Shastra for Beginners\n\nVastu Shastra is a traditional approach to planning and arranging spaces. Many people use it as a framework for thinking about orientation, movement, light and how a room feels.\n\n## Start with the basics\n\n- Keep entrances and pathways easy to use.\n- Make good use of daylight and ventilation.\n- Keep rooms organized for their intended purpose.\n- Consider the layout as a whole instead of making isolated changes.\n\nVastu recommendations vary by property and tradition. For a major renovation, consult an appropriately qualified professional and follow building and safety requirements.`, author: "Bhuwneshwari Scientific Vastu", status: "published", publishedAt: daysFromNow(-18), tags: ["Vastu Basics", "Home", "Guidance"], seo: { title: "Vastu Shastra for Beginners", description: "A practical introduction to Vastu principles for your home." } },
  { title: "Simple Ways to Create a Calm and Balanced Living Room", slug: "calm-balanced-living-room", excerpt: "Explore approachable layout, lighting and decluttering ideas for a more comfortable living room.", content: `# Create a Calm Living Room\n\nA comfortable living room begins with clear circulation and a layout that supports how your household spends time together.\n\n## Practical ideas\n\n1. Leave comfortable walking space between furniture.\n2. Use layered lighting for reading, conversation and general use.\n3. Reduce visual clutter and give everyday items a dedicated place.\n4. Choose materials and colors that feel comfortable to you.\n\nThese are general home-design suggestions, not a substitute for a property-specific Vastu assessment.`, author: "Bhuwneshwari Scientific Vastu", status: "published", publishedAt: daysFromNow(-12), tags: ["Living Room", "Home Design", "Wellbeing"], seo: { title: "Calm and Balanced Living Room", description: "Simple living-room layout and lighting ideas for a comfortable home." } },
  { title: "Choosing Vastu Products: What to Consider Before You Buy", slug: "choosing-vastu-products", excerpt: "A useful checklist for comparing materials, purpose, placement guidance and product details.", content: `# Choosing Vastu Products\n\nChoose products based on the purpose you have in mind, the available space and the information provided by the seller.\n\n## Before buying\n\n- Read dimensions and material details.\n- Check what is included in the package.\n- Review placement or care instructions.\n- Confirm delivery, return and warranty terms where applicable.\n- Ask questions when a listing does not provide enough detail.\n\nProducts can be meaningful decorative or cultural items, but claims about guaranteed outcomes should be treated carefully.`, author: "Bhuwneshwari Scientific Vastu", status: "published", publishedAt: daysFromNow(-6), tags: ["Products", "Buying Guide", "Vastu"], seo: { title: "How to Choose Vastu Products", description: "Compare Vastu products with a practical checklist before purchasing." } },
  { title: "Planning a Vastu Consultation: Questions to Prepare", slug: "planning-a-vastu-consultation", excerpt: "Prepare your floor plan, priorities and questions to make a consultation more focused.", content: `# Prepare for a Vastu Consultation\n\nA little preparation helps a consultation focus on your actual needs.\n\n## Helpful information\n\n- A floor plan with directions marked, if available.\n- The property type and approximate age.\n- Photos of relevant areas, where appropriate.\n- Your main concerns and the changes you are willing to consider.\n- Your budget and any structural limitations.\n\nNever share sensitive access codes or unnecessary personal information. Any structural changes should be reviewed for safety and local compliance.`, author: "Bhuwneshwari Scientific Vastu", status: "published", publishedAt: daysFromNow(-2), tags: ["Consultation", "Planning", "Tips"], seo: { title: "Prepare for a Vastu Consultation", description: "A checklist to help you prepare for a productive Vastu consultation." } },
  { title: "Vastu for a Home Office: Comfort, Focus and Function", slug: "vastu-home-office-comfort-focus", excerpt: "Combine traditional space-planning considerations with practical home-office ergonomics.", content: `# Vastu for a Home Office\n\nA home office should support comfort, focus and safe working habits. Traditional Vastu preferences may be considered alongside practical requirements.\n\n## Build a workable setup\n\n- Position your desk to avoid glare on the screen.\n- Use a supportive chair and appropriate monitor height.\n- Keep cables secured and walkways clear.\n- Add task lighting and manage noise where possible.\n- Choose a location where you can concentrate and take breaks.\n\nThere is no single layout that suits every building or person; adapt recommendations to your space and needs.`, author: "Bhuwneshwari Scientific Vastu", status: "draft", publishedAt: null, tags: ["Home Office", "Workspace", "Vastu"], seo: { title: "Vastu for Home Office", description: "Practical workspace ideas that combine comfort with traditional Vastu considerations." } },
  { title: "A Room-by-Room Home Harmony Checklist", slug: "room-by-room-home-harmony-checklist", excerpt: "A simple checklist for reviewing entryways, bedrooms, kitchens and shared spaces.", content: `# Room-by-Room Home Harmony Checklist\n\nUse this checklist as a starting point for reviewing how your home works day to day.\n\n- **Entryway:** keep the route clear and lighting adequate.\n- **Living area:** arrange seating for comfortable conversation.\n- **Kitchen:** prioritize ventilation, safe storage and clear work surfaces.\n- **Bedroom:** support rest with comfortable lighting and reduced clutter.\n- **Work area:** separate work materials from relaxation spaces where possible.\n\nTraditional Vastu interpretations differ. Prioritize building safety, accessibility and the needs of the people living in the home.`, author: "Bhuwneshwari Scientific Vastu", status: "scheduled", publishedAt: daysFromNow(5), tags: ["Checklist", "Home", "Vastu Tips"], seo: { title: "Home Harmony Checklist", description: "A room-by-room checklist for a comfortable and organized home." } }
];

const trainings = [
  { title: "Vastu Fundamentals", slug: "vastu-fundamentals", shortDescription: "An introductory course covering core concepts and practical observation.", description: "A beginner-friendly introduction to Vastu terminology, space planning and how to prepare for a property review.", price: 2999, duration: "4 weeks", format: "online", level: "Beginner", status: "published", featured: true, syllabus: ["Introduction to Vastu concepts", "Directions and floor-plan basics", "Room-by-room observation", "Preparing a property checklist"], seo: { title: "Vastu Fundamentals Course", description: "Learn introductory Vastu concepts in a structured online course." } },
  { title: "Practical Residential Vastu", slug: "practical-residential-vastu", shortDescription: "A structured look at residential layouts, common questions and case-study methods.", description: "Explore residential layout review and learn how to document observations and questions for professional consultation.", price: 6999, duration: "8 weeks", format: "online", level: "Intermediate", status: "published", featured: true, syllabus: ["Reading residential floor plans", "Room use and circulation", "Case-study documentation", "Consultation communication"], seo: { title: "Practical Residential Vastu Training", description: "A residential Vastu course focused on layout review and case studies." } },
  { title: "Vastu Consultation Workshop", slug: "vastu-consultation-workshop", shortDescription: "A workshop on client intake, site notes and communicating recommendations clearly.", description: "Practice organizing client information, documenting a site review and explaining options responsibly.", price: 1499, duration: "1 day", format: "online", level: "All levels", status: "draft", featured: false, syllabus: ["Client intake checklist", "Site notes and documentation", "Prioritizing recommendations", "Ethical client communication"], seo: { title: "Vastu Consultation Workshop", description: "A practical workshop for structuring consultation workflows." } }
];

const consultationTypes = ["Residential Vastu Consultation", "Office Vastu Consultation", "Plot & Property Guidance", "Follow-up Consultation"];
const consultationModes = ["online", "phone", "in_person"];
const consultationStatuses = ["pending", "confirmed", "completed", "pending", "cancelled", "confirmed"];
const sampleCustomers = [
  { name: "Aarav Sharma", email: "aarav.sharma@example.test", phone: "+919900000101" },
  { name: "Diya Patel", email: "diya.patel@example.test", phone: "+919900000102" },
  { name: "Rohan Mehta", email: "rohan.mehta@example.test", phone: "+919900000103" },
  { name: "Ananya Verma", email: "ananya.verma@example.test", phone: "+919900000104" },
  { name: "Vivaan Gupta", email: "vivaan.gupta@example.test", phone: "+919900000105" },
  { name: "Isha Joshi", email: "isha.joshi@example.test", phone: "+919900000106" },
  { name: "Arjun Singh", email: "arjun.singh@example.test", phone: "+919900000107" },
  { name: "Kavya Agarwal", email: "kavya.agarwal@example.test", phone: "+919900000108" },
  { name: "Aditya Jain", email: "aditya.jain@example.test", phone: "+919900000109" },
  { name: "Meera Shah", email: "meera.shah@example.test", phone: "+919900000110" }
];

await mongoose.connect(uri);
try {
  const settingResult = await StoreSettings.updateOne({ key: "main" }, { $setOnInsert: settings }, { upsert: true });
  console.log(settingResult.upsertedCount ? "Inserted default store settings." : "Store settings already exist; preserved admin changes.");

  let blogInserted = 0;
  for (const post of blogs) {
    const result = await BlogPost.updateOne({ slug: post.slug }, { $setOnInsert: post }, { upsert: true });
    if (result.upsertedCount) blogInserted++;
  }
  console.log(`Blog seed: ${blogInserted} new posts inserted; existing posts preserved (${blogs.length} slugs checked).`);

  let trainingInserted = 0;
  for (const training of trainings) {
    const result = await Training.updateOne({ slug: training.slug }, { $setOnInsert: { ...training, seedKey: `training:${training.slug}` } }, { upsert: true });
    if (result.upsertedCount) trainingInserted++;
  }
  console.log(`Training seed: ${trainingInserted} new courses inserted; ${trainings.length} checked.`);

  const users = await User.find({ email: { $in: sampleCustomers.map(c => c.email) } }).select("_id name email phone");
  const usersByEmail = new Map(users.map(user => [user.email, user]));
  const products = await Product.find({ status: { $ne: "archived" } }).select("_id").limit(20).lean();
  let cartsInserted = 0;
  for (const customer of sampleCustomers) {
    const user = usersByEmail.get(customer.email);
    if (!user) continue;
    const cartItems = products.length ? [{ product: products[0]._id, quantity: 1 }] : [];
    const result = await Cart.updateOne({ user: user._id }, { $setOnInsert: { user: user._id, items: cartItems, seedKey: `cart:${customer.email}` } }, { upsert: true });
    if (result.upsertedCount) cartsInserted++;
    if (products.length) await User.updateOne({ _id: user._id }, { $addToSet: { wishlist: products[(users.indexOf(user) + 1) % products.length]._id } });
  }
  console.log(`Cart seed: ${cartsInserted} new carts inserted; wishlists populated where products/customers exist.`);

  let consultationsInserted = 0;
  for (let i = 0; i < 12; i++) {
    const customerData = sampleCustomers[i % sampleCustomers.length];
    const customer = usersByEmail.get(customerData.email);
    const seedKey = `demo-consultation-${String(i + 1).padStart(3, "0")}`;
    const dayOffset = i < 4 ? i + 1 : i - 8;
    const date = daysFromNow(dayOffset);
    date.setHours(10 + (i % 7), i % 2 ? 30 : 0, 0, 0);
    const payload = {
      seedKey, ...(customer ? { customer: customer._id } : {}), name: customerData.name, email: customerData.email, phone: customerData.phone,
      type: consultationTypes[i % consultationTypes.length], mode: consultationModes[i % consultationModes.length], date,
      time: `${String(10 + (i % 7)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
      status: consultationStatuses[i % consultationStatuses.length], paymentStatus: i % 3 === 0 ? "paid" : "pending", amount: [1499, 2499, 999, 1999][i % 4],
      address: i % 3 === 0 ? "Online session" : "Demo address, India", notes: "Seeded demo booking; not a real appointment."
    };
    const result = await Consultation.updateOne({ seedKey }, { $setOnInsert: payload }, { upsert: true });
    if (result.upsertedCount) consultationsInserted++;
  }
  console.log(`Consultation seed: ${consultationsInserted} new demo bookings inserted; 12 checked.`);
  console.log("Seed content complete. Seeded settings do not contain payment secrets or live gateway credentials.");
  console.log("Important: published sample blog posts and demo bookings are illustrative. Replace example support contact details before launch.");
} finally {
  await mongoose.disconnect();
}
