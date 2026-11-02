import { connectDB } from "../lib/dbConnect.js";
import Enrollment from "../models/Enrollment.js";
import Training from "../models/Training.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Consultation from "../models/Consultation.js";
import {
  generatePayUHash,
  verifyPayUResponse,
  getPayUEndpoint,
  isPayUConfigured,
} from "../lib/payu.js";

const DEFAULT_COURSE_WHATSAPP_LINKS = {
  "bhuwneshwari scientific vastu master class":
    "https://chat.whatsapp.com/BhuwneshwariMasterClass",
  "advanced vastu workshop":
    "https://chat.whatsapp.com/AdvancedVastuWorkshop",
  "personalized vastu training":
    "https://chat.whatsapp.com/PersonalizedVastuTraining",
};

function getWhatsappLinkForCourse(title = "", customLink = "") {
  if (customLink && customLink.trim()) return customLink.trim();
  const normalized = title.trim().toLowerCase();
  return (
    DEFAULT_COURSE_WHATSAPP_LINKS[normalized] ||
    process.env.DEFAULT_WHATSAPP_LINK ||
    "https://chat.whatsapp.com/BhuwneshwariVastu"
  );
}

const digitsOnly = (v = "") => String(v).replace(/\D/g, "");

/**
 * Check if current user is enrolled in a specific program or get all user enrollments
 */
export async function getMyEnrollments(req, res) {
  try {
    await connectDB();
    const phone =
      digitsOnly(req.query.phone || req.user?.phone || "") || undefined;

    if (!phone) {
      return res.json({ success: true, data: [] });
    }

    const enrollments = await Enrollment.find({
      userPhone: phone,
      paymentStatus: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("getMyEnrollments error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to retrieve enrollments" });
  }
}

/**
 * Initiate PayU payment for Training enrollment
 */
export async function initiateEnrollment(req, res) {
  try {
    await connectDB();
    const {
      courseTitle,
      courseSlug = "",
      amount,
      name = "",
      email = "",
      phone = "",
    } = req.body;

    const cleanedPhone = digitsOnly(phone);
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "A valid mobile number is required for enrollment",
      });
    }

    if (!courseTitle || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid course and amount are required",
      });
    }

    // Check if user is ALREADY enrolled and paid for this course
    const existing = await Enrollment.findOne({
      userPhone: cleanedPhone,
      courseTitle: { $regex: new RegExp(`^${courseTitle.trim()}$`, "i") },
      paymentStatus: "paid",
    }).lean();

    if (existing) {
      return res.status(400).json({
        success: false,
        alreadyEnrolled: true,
        error: "You are already enrolled in this training program.",
        enrollment: existing,
      });
    }

    // Fetch custom WhatsApp link from Training model if configured
    const trainingDoc = await Training.findOne({
      $or: [
        { title: { $regex: new RegExp(`^${courseTitle.trim()}$`, "i") } },
        { slug: courseSlug },
      ],
    }).lean();

    const whatsappLink = getWhatsappLinkForCourse(
      courseTitle,
      trainingDoc?.whatsappLink
    );

    const enrollmentId = `BSV-ENR-${Date.now().toString().slice(-6)}`;
    const txnid = `TXN_ENR_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Look up user if exists
    const userDoc = await User.findOne({ phone: cleanedPhone }).lean();

    // Create or update pending enrollment
    await Enrollment.findOneAndUpdate(
      {
        userPhone: cleanedPhone,
        courseTitle: courseTitle.trim(),
        paymentStatus: { $ne: "paid" },
      },
      {
        enrollmentId,
        user: userDoc?._id || undefined,
        userPhone: cleanedPhone,
        userName: name.trim(),
        userEmail: email.trim(),
        courseTitle: courseTitle.trim(),
        courseSlug: courseSlug.trim(),
        amount: Number(amount),
        currency: "INR",
        paymentStatus: "pending",
        paymentProvider: "payu",
        txnid,
        whatsappLink,
        status: "active",
      },
      { upsert: true, new: true }
    );

    const firstname = (name.trim() || "Student").split(" ")[0];
    const userEmail = email.trim() || "student@bhuwneshwarivastu.com";
    const productinfo = `Training Enrollment: ${courseTitle.trim().slice(0, 50)}`;

    const hash = generatePayUHash({
      txnid,
      amount,
      productinfo,
      firstname,
      email: userEmail,
      udf1: enrollmentId,
      udf2: "training",
    });

    const surl =
      process.env.PAYU_SUCCESS_URL || "http://localhost:3000/payment-success";
    const furl =
      process.env.PAYU_FAILURE_URL || "http://localhost:3000/payment-failure";

    return res.json({
      success: true,
      action: getPayUEndpoint(),
      isConfigured: isPayUConfigured(),
      enrollmentId,
      txnid,
      whatsappLink,
      params: {
        key: process.env.PAYU_KEY || "TEST_KEY",
        txnid,
        amount: Number(amount).toFixed(2),
        productinfo,
        firstname,
        email: userEmail,
        phone: cleanedPhone,
        surl,
        furl,
        hash,
        udf1: enrollmentId,
        udf2: "training",
      },
    });
  } catch (error) {
    console.error("initiateEnrollment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to initiate enrollment" });
  }
}

/**
 * Verify PayU payment for Training enrollment
 */
export async function verifyEnrollment(req, res) {
  try {
    await connectDB();
    const data = req.body || {};
    const { txnid, enrollmentId, status } = data;

    if (!txnid && !enrollmentId) {
      return res.status(400).json({
        success: false,
        error: "Missing transaction ID or enrollment ID",
      });
    }

    const filter = txnid ? { txnid } : { enrollmentId };
    const enrollment = await Enrollment.findOne(filter);

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, error: "Enrollment record not found" });
    }

    if (enrollment.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Enrollment is already verified and active",
        enrollment,
      });
    }

    const isValid = verifyPayUResponse(data);
    if (!isValid && status !== "success") {
      enrollment.paymentStatus = "failed";
      await enrollment.save();
      return res
        .status(400)
        .json({ success: false, error: "Payment verification failed" });
    }

    enrollment.paymentStatus = "paid";
    enrollment.paymentReference =
      data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
    await enrollment.save();

    return res.json({
      success: true,
      message: "Payment successfully verified! Enrollment active.",
      enrollment: {
        enrollmentId: enrollment.enrollmentId,
        courseTitle: enrollment.courseTitle,
        amount: enrollment.amount,
        currency: enrollment.currency,
        whatsappLink: enrollment.whatsappLink,
        userName: enrollment.userName,
        userPhone: enrollment.userPhone,
        enrolledAt: enrollment.updatedAt,
      },
    });
  } catch (error) {
    console.error("verifyEnrollment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to verify enrollment payment" });
  }
}

/**
 * Initiate PayU payment for Product Order Checkout
 */
export async function initiateOrderPayment(req, res) {
  try {
    await connectDB();
    const {
      items = [],
      customer = {},
      subtotal = 0,
      shipping = 0,
      discount = 0,
      total = 0,
      coupon = null,
      shippingAddress = {},
    } = req.body;

    if (!items.length || Number(total) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty or invalid total amount",
      });
    }

    const cleanedPhone = digitsOnly(customer.phone);
    const orderNumber = `BSV-${Date.now().toString().slice(-8)}`;
    const txnid = `TXN_ORD_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Find user by phone if available
    const userDoc = cleanedPhone
      ? await User.findOne({ phone: cleanedPhone }).lean()
      : null;

    // Create pending order
    const newOrder = await Order.create({
      orderNumber,
      customer: userDoc?._id || undefined,
      customerSnapshot: { ...customer, phone: cleanedPhone },
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      discount: Number(req.body.discount || 0),
      coupon: String(req.body.coupon || "").trim(),
      tax: 0,
      total: Number(total),
      currency: "INR",
      shippingAddress: {
        address: customer.address || shippingAddress.address || "",
        landmark: customer.landmark || shippingAddress.landmark || "",
        city: customer.city || shippingAddress.city || "",
        state: customer.state || shippingAddress.state || "",
        pincode: customer.pincode || shippingAddress.pincode || "",
      },
      status: "pending",
      paymentStatus: "pending",
      paymentProvider: "payu",
      paymentReference: txnid,
      trackingNumber: "",
    });

    const firstname = (customer.fullName || customer.name || "Customer")
      .trim()
      .split(" ")[0];
    const email = customer.email?.trim() || "orders@bhuwneshwarivastu.com";
    const productinfo = `BSV Order ${orderNumber} (${items.length} items)`.slice(
      0,
      50
    );

    const hash = generatePayUHash({
      txnid,
      amount: total,
      productinfo,
      firstname,
      email,
      udf1: orderNumber,
      udf2: "order",
    });

    const surl =
      process.env.PAYU_SUCCESS_URL || "http://localhost:3000/payment-success";
    const furl =
      process.env.PAYU_FAILURE_URL || "http://localhost:3000/payment-failure";

    return res.json({
      success: true,
      action: getPayUEndpoint(),
      isConfigured: isPayUConfigured(),
      orderNumber,
      txnid,
      orderId: newOrder._id,
      params: {
        key: process.env.PAYU_KEY || "TEST_KEY",
        txnid,
        amount: Number(total).toFixed(2),
        productinfo,
        firstname,
        email,
        phone: cleanedPhone,
        surl,
        furl,
        hash,
        udf1: orderNumber,
        udf2: "order",
      },
    });
  } catch (error) {
    console.error("initiateOrderPayment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to initiate order payment" });
  }
}

/**
 * Verify PayU payment for Product Order Checkout
 */
export async function verifyOrderPayment(req, res) {
  try {
    await connectDB();
    const data = req.body || {};
    const { txnid, orderNumber, status } = data;

    if (!txnid && !orderNumber) {
      return res.status(400).json({
        success: false,
        error: "Missing transaction ID or order number",
      });
    }

    const filter = orderNumber
      ? { orderNumber }
      : { paymentReference: txnid };
    const order = await Order.findOne(filter);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "Order record not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Order payment already verified",
        order,
      });
    }

    const isValid = verifyPayUResponse(data);
    if (!isValid && status !== "success") {
      order.paymentStatus = "failed";
      await order.save();
      return res
        .status(400)
        .json({ success: false, error: "Payment verification failed" });
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentReference =
      data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
    await order.save();

    return res.json({
      success: true,
      message: "Payment successfully verified! Order confirmed.",
      order,
    });
  } catch (error) {
    console.error("verifyOrderPayment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to verify order payment" });
  }
}

/**
 * Cash on Delivery (COD) order placement
 */
export async function createCodOrder(req, res) {
  try {
    await connectDB();
    const {
      items = [],
      customer = {},
      subtotal = 0,
      shipping = 0,
      discount = 0,
      total = 0,
      shippingAddress = {},
    } = req.body;

    if (!items.length || Number(total) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty or invalid total amount",
      });
    }

    const cleanedPhone = digitsOnly(customer.phone);
    const orderNumber = `BSV-${Date.now().toString().slice(-8)}`;

    const userDoc = cleanedPhone
      ? await User.findOne({ phone: cleanedPhone }).lean()
      : null;

    const newOrder = await Order.create({
      orderNumber,
      customer: userDoc?._id || undefined,
      customerSnapshot: { ...customer, phone: cleanedPhone },
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      discount: Number(req.body.discount || 0),
      coupon: String(req.body.coupon || "").trim(),
      tax: 0,
      total: Number(total),
      currency: "INR",
      shippingAddress: {
        address: customer.address || shippingAddress.address || "",
        landmark: customer.landmark || shippingAddress.landmark || "",
        city: customer.city || shippingAddress.city || "",
        state: customer.state || shippingAddress.state || "",
        pincode: customer.pincode || shippingAddress.pincode || "",
      },
      status: "confirmed",
      paymentStatus: "pending",
      paymentProvider: "cod",
      paymentReference: "COD",
      trackingNumber: "",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully (Cash on Delivery)",
      order: newOrder,
    });
  } catch (error) {
    console.error("createCodOrder error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to place COD order" });
  }
}

export async function getAdminEnrollments(req, res) {
  try {
    await connectDB();
    const data = await Enrollment.find({}).sort({ createdAt: -1 }).lean();
    const normalized = data.map((e) => {
      const isPaid = e.paymentStatus === "paid";
      const tot = Number(e.amount || 0);
      const paid = e.paidAmount !== undefined ? Number(e.paidAmount) : (isPaid ? tot : 0);
      const due = e.dueAmount !== undefined ? Number(e.dueAmount) : Math.max(0, tot - paid);
      return {
        ...e,
        paidAmount: paid,
        dueAmount: due,
      };
    });
    return res.json({ success: true, data: normalized });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch enrollments" });
  }
}

export async function createAdminEnrollment(req, res) {
  try {
    const b = req.body || {};
    const { userName, userPhone, userEmail, courseTitle, courseSlug, amount, paidAmount, paymentMethod, whatsappLink, notes } = b;

    if (!userPhone?.trim() || !courseTitle?.trim()) {
      return res.status(400).json({ success: false, error: "Student phone number and course title are required" });
    }

    const cleanedPhone = userPhone.replace(/\D/g, "").slice(-10);
    const totalAmount = Number(amount || 0);
    const paid = Math.max(0, Number(paidAmount || 0));
    const due = Math.max(0, totalAmount - paid);
    const method = String(paymentMethod || "Cash").trim();

    let paymentStatus = "pending";
    let paymentType = "unpaid";
    if (paid >= totalAmount && totalAmount > 0) {
      paymentStatus = "paid";
      paymentType = "full";
    } else if (paid > 0) {
      paymentStatus = "partial";
      paymentType = "partial";
    }

    const enrollmentId = `BSV-ENR-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentHistory = [];
    if (paid > 0) {
      paymentHistory.push({
        amount: paid,
        method,
        date: new Date(),
        notes: notes || (due > 0 ? `Initial partial enrollment payment. Due: ₹${due}` : "Full payment"),
        reference: `MANUAL-${Date.now().toString().slice(-6)}`,
      });
    }

    const resolvedWhatsappLink = getWhatsappLinkForCourse(courseTitle, whatsappLink);

    await connectDB();
    const enrollment = await Enrollment.create({
      enrollmentId,
      userName: userName || "Student",
      userPhone: cleanedPhone,
      userEmail: userEmail || "",
      courseTitle,
      courseSlug: courseSlug || "",
      amount: totalAmount,
      paidAmount: paid,
      dueAmount: due,
      paymentType,
      paymentHistory,
      paymentStatus,
      paymentProvider: method,
      whatsappLink: resolvedWhatsappLink,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (err) {
    console.error("createAdminEnrollment error:", err);
    return res.status(500).json({ success: false, error: "Unable to enroll student" });
  }
}

export async function recordAdminEnrollmentPayment(req, res) {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount || 0);
    const method = String(req.body.method || "Cash").trim();
    const notes = String(req.body.notes || "").trim();
    const reference = String(req.body.reference || `REC-ENR-${Date.now().toString().slice(-6)}`);

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Payment amount must be greater than 0" });
    }

    await connectDB();
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    const currentPaid = Number(enrollment.paidAmount || (enrollment.paymentStatus === "paid" ? enrollment.amount : 0));
    const newPaid = currentPaid + amount;
    const newDue = Math.max(0, Number(enrollment.amount) - newPaid);

    enrollment.paidAmount = newPaid;
    enrollment.dueAmount = newDue;
    enrollment.paymentType = newDue === 0 ? "full" : "partial";
    enrollment.paymentStatus = newDue === 0 ? "paid" : "partial";

    if (!enrollment.paymentHistory) enrollment.paymentHistory = [];
    enrollment.paymentHistory.push({
      amount,
      method,
      date: new Date(),
      notes: notes || `Payment recorded. Remaining balance: ₹${newDue}`,
      reference,
    });

    await enrollment.save();

    return res.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully.`,
      data: enrollment,
    });
  } catch (err) {
    console.error("recordAdminEnrollmentPayment error:", err);
    return res.status(500).json({ success: false, error: "Unable to record payment" });
  }
}

/**
 * Handle PayU callback/webhook/redirect (POST from PayU)
 */
export async function handlePayUResponse(req, res) {
  try {
    await connectDB();
    const data = req.body || {};
    const { txnid, status, udf1, udf2 } = data;
    const getFrontendUrl = () => {
      if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
      if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
        return process.env.CORS_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
      }
      return "https://vastu-user.vercel.app";
    };
    const frontendUrl = getFrontendUrl();

    console.log("Received PayU callback:", { txnid, status, udf1, udf2 });

    const isValid = verifyPayUResponse(data);
    const isSuccess = (status === "success");

    // 1. Donation check
    if (udf2 === "donation" || (!udf2 && String(udf1 || "").startsWith("BSV-NGO"))) {
      const donation = await Donation.findOne({
        $or: [{ txnid }, { donationId: udf1 }],
      });

      if (donation) {
        if (isSuccess) {
          donation.paymentStatus = "paid";
          donation.paymentReference = data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
          await donation.save();

          return res.redirect(
            `${frontendUrl}/payment-success?type=donation&status=success&donationId=${donation.donationId}&txnid=${txnid}&amount=${donation.amount}`
          );
        } else {
          donation.paymentStatus = "failed";
          await donation.save();

          return res.redirect(
            `${frontendUrl}/payment-failure?type=donation&txnid=${txnid}&error=${encodeURIComponent(data.error_Message || "Payment was not completed")}`
          );
        }
      }
    }

    // 2. Training check
    if (udf2 === "training" || (!udf2 && String(udf1 || "").startsWith("BSV-ENR"))) {
      const enrollment = await Enrollment.findOne({
        $or: [{ txnid }, { enrollmentId: udf1 }],
      });

      if (enrollment) {
        if (isSuccess) {
          enrollment.paymentStatus = "paid";
          enrollment.paidAmount = enrollment.amount;
          enrollment.dueAmount = 0;
          enrollment.paymentType = "full";
          enrollment.paymentReference = data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
          await enrollment.save();

          return res.redirect(
            `${frontendUrl}/payment-success?type=training&status=success&enrollmentId=${enrollment.enrollmentId}&txnid=${txnid}&course=${encodeURIComponent(enrollment.courseTitle)}`
          );
        } else {
          enrollment.paymentStatus = "failed";
          await enrollment.save();

          return res.redirect(
            `${frontendUrl}/payment-failure?type=training&txnid=${txnid}&error=${encodeURIComponent(data.error_Message || "Payment was not completed")}`
          );
        }
      }
    }

    // 3. Appointment check
    if (udf2 === "appointment" || (!udf2 && String(udf1 || "").startsWith("BSV-APT"))) {
      const consultation = await Consultation.findOne({
        $or: [{ txnid }, { reference: udf1 }],
      });

      if (consultation) {
        if (isSuccess) {
          consultation.paymentStatus = "paid";
          consultation.status = "confirmed";
          consultation.paymentReference = data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
          await consultation.save();

          return res.redirect(
            `${frontendUrl}/payment-success?type=appointment&status=success&reference=${consultation.reference}&amount=${consultation.amount}&service=${encodeURIComponent(consultation.type)}&txnid=${txnid}`
          );
        } else {
          consultation.paymentStatus = "failed";
          await consultation.save();

          return res.redirect(
            `${frontendUrl}/payment-failure?type=appointment&txnid=${txnid}&error=${encodeURIComponent(data.error_Message || "Payment was not completed")}`
          );
        }
      }
    }

    // 4. Order check
    const order = await Order.findOne({
      $or: [{ orderNumber: udf1 }, { paymentReference: txnid }],
    });

    if (order) {
      if (isSuccess) {
        order.paymentStatus = "paid";
        order.status = "confirmed";
        order.paidAmount = order.total;
        order.dueAmount = 0;
        order.paymentType = "full";
        order.paymentReference = data.payuMoneyId || data.mihpayid || data.bank_ref_num || txnid;
        await order.save();

        return res.redirect(
          `${frontendUrl}/payment-success?type=order&status=success&orderId=${order.orderNumber}&txnid=${txnid}`
        );
      } else {
        order.paymentStatus = "failed";
        await order.save();

        return res.redirect(
          `${frontendUrl}/payment-failure?type=order&txnid=${txnid}&error=${encodeURIComponent(data.error_Message || "Payment was not completed")}`
        );
      }
    }

    // Default redirect
    if (isSuccess) {
      return res.redirect(`${frontendUrl}/payment-success?status=success&txnid=${txnid}`);
    } else {
      return res.redirect(`${frontendUrl}/payment-failure?status=failed&txnid=${txnid}`);
    }
  } catch (error) {
    console.error("handlePayUResponse error:", error);
    const getFrontendUrl = () => {
      if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
      if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
        return process.env.CORS_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
      }
      return "https://vastu-user.vercel.app";
    };
    const frontendUrl = getFrontendUrl();
    return res.redirect(`${frontendUrl}/payment-failure?error=server_error`);
  }
}
