import { connectDB } from "../lib/dbConnect.js";
import StoreSettings from "../models/StoreSettings.js";

const DEFAULTS = {
  general: {
    storeName: "Bhuwneshwari Scientific Vastu",
    tagline: "Bring balance and harmony to your spaces",
    supportEmail: "support@example.com",
    supportPhone: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    country: "IN",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "Rajasthan",
      postalCode: "",
      country: "India",
    },
    logoUrl: "",
    footerText: "© Bhuwneshwari Scientific Vastu. All rights reserved.",
    legalName: "Bhuwneshwari Scientific Vastu",
    announcementEnabled: false,
    announcementText: "",
    contactWhatsapp: "",
  },
  maintenance: {
    enabled: false,
    message: "We are improving our store. Please check back soon.",
    allowAdminAccess: true,
    showEstimatedReturn: false,
    estimatedReturn: "",
    allowNewsletter: true,
  },
  appearance: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#B68A3A",
    secondaryColor: "#3A2B20",
    backgroundColor: "#FAF7F0",
    fontFamily: "inherit",
    showAnnouncementBar: false,
    showFloatingBookNow: true,
    homepageHeroTitle: "Bring Harmony Into Your Home",
    homepageHeroSubtitle: "Discover thoughtful Vastu products and expert guidance for balanced living.",
    homepageHeroImage: "",
    homepageHeroCtaText: "Explore Products",
    homepageHeroCtaUrl: "/products",
  },
  payments: {
    codEnabled: false,
    onlineEnabled: true,
    razorpayEnabled: false,
    stripeEnabled: false,
    upiEnabled: true,
    bankTransferEnabled: false,
    testMode: true,
    autoCapture: true,
    minimumOrder: "0",
    currency: "INR",
    refundPolicy: "Refunds are reviewed according to the store's published refund policy.",
    mode: "test",
    onlinePaymentsEnabled: true,
    provider: "payu",
  },
  shipping: {
    shippingEnabled: true,
    freeShippingEnabled: false,
    freeShippingThreshold: 1999,
    flatRateEnabled: true,
    flatRate: 99,
    localPickupEnabled: false,
    processingDays: "2",
    deliveryNote: "Delivery timelines depend on the destination and courier.",
    allowedCountries: "India",
    estimatedMinDays: 3,
    estimatedMaxDays: 7,
    shippingCountries: ["IN"],
    returnWindowDays: 7,
    returnPolicy: "Contact support to request a return. Eligibility is subject to review.",
  },
  inventory: {
    lowStockThreshold: 5,
    allowBackorders: false,
    hideOutOfStock: false,
    reserveStockMinutes: 15,
    defaultStock: 0,
  },
  consultations: {
    enabled: true,
    onlineEnabled: true,
    inPersonEnabled: true,
    requireAdvancePayment: false,
    allowReschedule: true,
    minimumNotice: "24",
    bufferMinutes: "15",
    confirmationEmail: true,
    defaultPrice: 1499,
    currency: "INR",
    modes: ["online", "phone", "in_person"],
  },
  training: {
    enabled: true,
    enrollmentEnabled: true,
    allowWaitlist: true,
    certificateEnabled: false,
    confirmationEmail: true,
    showFees: true,
    showOnNavigation: true,
    enquiryEmail: "support@example.com",
    defaultCurrency: "INR",
  },
  blog: {
    enabled: true,
    commentsEnabled: false,
    moderationRequired: true,
    showAuthor: true,
    showPublishDate: true,
    showReadingTime: true,
    postsPerPage: 9,
    defaultCategory: "Vastu Guidance",
    defaultAuthor: "Bhuwneshwari Scientific Vastu",
  },
  seo: {
    siteTitle: "Bhuwneshwari Scientific Vastu | Vastu Products & Consultation",
    description: "Explore Vastu products, expert consultations, training and practical guidance.",
    keywords: "Vastu Shastra, Vastu consultation, Vastu products",
    canonicalUrl: "",
    robotsIndex: true,
    sitemapEnabled: true,
    socialImage: "",
  },
  notifications: {
    orderNotifications: true,
    paymentNotifications: true,
    consultationNotifications: true,
    trainingNotifications: true,
    contactFormNotifications: true,
  },
  security: {
    sessionTimeout: "60",
    loginAlerts: true,
    twoFactorRequired: false,
    customerRegistration: true,
    passwordResetEnabled: true,
    rateLimitEnabled: true,
    adminMobile: "8690708302",
    maintenanceAdminBypass: true,
  },
  donation: {
    enabled: true,
    ngoName: "Choti Khushi NGO - feeding work for Birds",
    suggestedAmounts: "500, 1000, 10000",
    description: "Support daily feeding and water bowls for sacred birds and pigeons.",
    allowCustomAmount: true,
  },
};

export async function getPublicSettings(req, res) {
  try {
    await connectDB();
    const doc = await StoreSettings.findOne({ key: "main" }).lean();
    const data = doc || { key: "main", ...DEFAULTS };

    // Strip sensitive secrets if any
    const publicPayments = { ...(data.payments || {}) };
    delete publicPayments.razorpayKeySecret;
    delete publicPayments.stripeSecretKey;
    delete publicPayments.payuSalt;

    const publicSecurity = { ...(data.security || {}) };
    delete publicSecurity.authSecret;

    return res.json({
      success: true,
      data: {
        ...data,
        payments: publicPayments,
        security: publicSecurity,
      },
    });
  } catch (error) {
    console.error("getPublicSettings error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch store settings" });
  }
}

export async function getAdminSettings(req, res) {
  try {
    await connectDB();
    const doc = await StoreSettings.findOne({ key: "main" }).lean();
    return res.json({
      success: true,
      data: doc || { key: "main", ...DEFAULTS },
    });
  } catch (error) {
    console.error("getAdminSettings error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch settings" });
  }
}

export async function updateAdminSettings(req, res) {
  try {
    const body = req.body || {};
    const allowed = [
      "general",
      "maintenance",
      "appearance",
      "payments",
      "shipping",
      "inventory",
      "consultations",
      "training",
      "blog",
      "seo",
      "notifications",
      "security",
      "donation",
    ];
    const update = {};

    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    await connectDB();
    const data = await StoreSettings.findOneAndUpdate(
      { key: "main" },
      { $set: update, $setOnInsert: { key: "main" } },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({ success: true, data });
  } catch (error) {
    console.error("updateAdminSettings error:", error);
    return res.status(500).json({ success: false, error: "Unable to save settings" });
  }
}
