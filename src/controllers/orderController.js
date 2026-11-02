import mongoose from "mongoose";
import { connectDB } from "../lib/dbConnect.js";
import Order from "../models/Order.js";
import Enrollment from "../models/Enrollment.js";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const payments = ["pending", "partial", "paid", "failed", "refunded"];

export async function getAdminOrders(req, res) {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
    const status = req.query.status;
    const filter = status ? { status } : {};

    const [data, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Normalize paidAmount & dueAmount for existing records
    const normalized = data.map((o) => {
      const isPaid = o.paymentStatus === "paid" || o.status === "delivered";
      const tot = Number(o.total || 0);
      const paid = o.paidAmount !== undefined ? Number(o.paidAmount) : (isPaid ? tot : 0);
      const due = o.dueAmount !== undefined ? Number(o.dueAmount) : Math.max(0, tot - paid);
      return {
        ...o,
        paidAmount: paid,
        dueAmount: due,
      };
    });

    return res.json({
      success: true,
      data: normalized,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch orders" });
  }
}

export async function getAdminOrderById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid order id" });
    }

    await connectDB();
    const data = await Order.findById(id).lean();

    if (!data) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to fetch order" });
  }
}

export async function createAdminOrder(req, res) {
  try {
    const b = req.body || {};
    const customerName = String(b.customerName || b.customer || "").trim();
    const customerPhone = String(b.customerPhone || b.phone || "").trim();
    const customerEmail = String(b.customerEmail || b.email || "").trim();
    const address = String(b.address || "").trim();
    const items = Array.isArray(b.items) && b.items.length > 0 ? b.items : [
      {
        name: b.productName || "Custom Order / Service",
        price: Number(b.amount || b.total || 0),
        quantity: 1,
        lineTotal: Number(b.amount || b.total || 0),
      },
    ];

    const subtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
    const shipping = Number(b.shipping || 0);
    const total = Number(b.total !== undefined ? b.total : (subtotal + shipping));
    const paidAmount = Math.max(0, Number(b.paidAmount || 0));
    const dueAmount = Math.max(0, total - paidAmount);
    const paymentMethod = String(b.paymentMethod || "Cash").trim();

    let paymentStatus = "pending";
    let paymentType = "unpaid";
    if (paidAmount >= total && total > 0) {
      paymentStatus = "paid";
      paymentType = "full";
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
      paymentType = "partial";
    }

    const orderNumber = `BSV-${Date.now().toString().slice(-8)}`;

    const paymentHistory = [];
    if (paidAmount > 0) {
      paymentHistory.push({
        amount: paidAmount,
        method: paymentMethod,
        date: new Date(),
        notes: b.paymentNotes || (dueAmount > 0 ? `Initial partial payment. Due: ₹${dueAmount}` : "Full payment"),
        reference: b.paymentReference || `MANUAL-${Date.now().toString().slice(-6)}`,
      });
    }

    await connectDB();
    const order = await Order.create({
      orderNumber,
      customerSnapshot: {
        name: customerName || "Offline Customer",
        email: customerEmail,
        phone: customerPhone,
      },
      items,
      subtotal,
      shipping,
      total,
      paidAmount,
      dueAmount,
      paymentType,
      paymentHistory,
      currency: "INR",
      shippingAddress: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        line1: address,
      },
      status: b.status || "confirmed",
      paymentStatus,
      paymentProvider: paymentMethod,
      notes: b.notes || (dueAmount > 0 ? `Partial payment. Balance due: ₹${dueAmount}` : ""),
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    console.error("createAdminOrder error:", err);
    return res.status(500).json({ success: false, error: "Unable to create order" });
  }
}

export async function updateAdminOrder(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid order id" });
    }

    const b = req.body;
    const update = {};

    if (b.status !== undefined) {
      if (!statuses.includes(b.status)) {
        return res.status(400).json({ success: false, error: "Invalid order status" });
      }
      update.status = b.status;
    }

    if (b.paymentStatus !== undefined) {
      if (!payments.includes(b.paymentStatus)) {
        return res.status(400).json({ success: false, error: "Invalid payment status" });
      }
      update.paymentStatus = b.paymentStatus;
    }

    if (b.trackingNumber !== undefined) {
      update.trackingNumber = String(b.trackingNumber).slice(0, 120);
    }

    if (b.notes !== undefined) {
      update.notes = String(b.notes);
    }

    if (b.paidAmount !== undefined) {
      update.paidAmount = Math.max(0, Number(b.paidAmount));
    }
    if (b.dueAmount !== undefined) {
      update.dueAmount = Math.max(0, Number(b.dueAmount));
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, error: "No supported fields supplied" });
    }

    await connectDB();
    const data = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!data) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to update order" });
  }
}

export async function recordAdminOrderPayment(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid order id" });
    }

    const amount = Number(req.body.amount || 0);
    const method = String(req.body.method || "Cash").trim();
    const notes = String(req.body.notes || "").trim();
    const reference = String(req.body.reference || `REC-${Date.now().toString().slice(-6)}`);

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Payment amount must be greater than 0" });
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const currentPaid = Number(order.paidAmount || (order.paymentStatus === "paid" ? order.total : 0));
    const newPaid = currentPaid + amount;
    const newDue = Math.max(0, Number(order.total) - newPaid);

    order.paidAmount = newPaid;
    order.dueAmount = newDue;
    order.paymentType = newDue === 0 ? "full" : "partial";
    order.paymentStatus = newDue === 0 ? "paid" : "partial";

    if (!order.paymentHistory) order.paymentHistory = [];
    order.paymentHistory.push({
      amount,
      method,
      date: new Date(),
      notes: notes || `Payment recorded. Remaining balance: ₹${newDue}`,
      reference,
    });

    await order.save();

    return res.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully.`,
      data: order,
    });
  } catch (err) {
    console.error("recordAdminOrderPayment error:", err);
    return res.status(500).json({ success: false, error: "Unable to record payment" });
  }
}

export async function deleteAdminOrder(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid order id" });
    }

    await connectDB();
    const data = await Order.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    return res.json({ success: true, message: "Order deleted successfully" });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to delete order" });
  }
}

export async function getAdminDuePayments(req, res) {
  try {
    await connectDB();

    const [orders, enrollments] = await Promise.all([
      Order.find({
        $or: [
          { dueAmount: { $gt: 0 } },
          { paymentStatus: "partial" },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
      Enrollment.find({
        $or: [
          { dueAmount: { $gt: 0 } },
          { paymentStatus: "partial" },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const dueOrders = orders.map((o) => ({
      _id: o._id,
      type: "order",
      refId: o.orderNumber || `ORD-${String(o._id).slice(-6).toUpperCase()}`,
      customerName: o.customerSnapshot?.name || o.shippingAddress?.name || "Customer",
      customerPhone: o.customerSnapshot?.phone || o.shippingAddress?.phone || "—",
      customerEmail: o.customerSnapshot?.email || o.shippingAddress?.email || "—",
      title: o.items?.[0]?.name || `${o.items?.length || 1} Item(s)`,
      totalAmount: Number(o.total || 0),
      paidAmount: Number(o.paidAmount || 0),
      dueAmount: Number(o.dueAmount || Math.max(0, o.total - (o.paidAmount || 0))),
      paymentStatus: o.paymentStatus || "partial",
      paymentProvider: o.paymentProvider || "Cash",
      paymentHistory: o.paymentHistory || [],
      date: o.createdAt,
    }));

    const dueEnrollments = enrollments.map((e) => ({
      _id: e._id,
      type: "training",
      refId: e.enrollmentId,
      customerName: e.userName || "Student",
      customerPhone: e.userPhone || "—",
      customerEmail: e.userEmail || "—",
      title: e.courseTitle || "Training Program",
      totalAmount: Number(e.amount || 0),
      paidAmount: Number(e.paidAmount || 0),
      dueAmount: Number(e.dueAmount || Math.max(0, e.amount - (e.paidAmount || 0))),
      paymentStatus: e.paymentStatus || "partial",
      paymentProvider: e.paymentProvider || "Cash",
      paymentHistory: e.paymentHistory || [],
      date: e.createdAt,
    }));

    const allDue = [...dueOrders, ...dueEnrollments].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.json({
      success: true,
      data: allDue,
      totals: {
        totalDue: allDue.reduce((sum, item) => sum + item.dueAmount, 0),
        totalItems: allDue.length,
        dueOrdersCount: dueOrders.length,
        dueEnrollmentsCount: dueEnrollments.length,
      },
    });
  } catch (err) {
    console.error("getAdminDuePayments error:", err);
    return res.status(500).json({ success: false, error: "Unable to fetch due payments" });
  }
}

export async function getMyOrders(req, res) {
  try {
    await connectDB();
    const phone = req.user?.phone || req.query.phone;
    if (!phone) {
      return res.json({ success: true, data: [] });
    }

    const cleaned = String(phone).replace(/\D/g, "").slice(-10);

    const orders = await Order.find({
      $or: [
        { "customerSnapshot.phone": cleaned },
        { "shippingAddress.phone": cleaned },
        ...(req.user?._id ? [{ customer: req.user._id }] : []),
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const normalized = orders.map((o) => {
      const isPaid = o.paymentStatus === "paid" || o.status === "delivered";
      const tot = Number(o.total || 0);
      const paid = o.paidAmount !== undefined ? Number(o.paidAmount) : (isPaid ? tot : 0);
      const due = o.dueAmount !== undefined ? Number(o.dueAmount) : Math.max(0, tot - paid);
      return {
        ...o,
        paidAmount: paid,
        dueAmount: due,
      };
    });

    return res.json({ success: true, data: normalized });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch user orders" });
  }
}
