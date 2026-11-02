import { connectDB } from "../lib/dbConnect.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Consultation from "../models/Consultation.js";
import Ticket from "../models/Ticket.js";
import Enrollment from "../models/Enrollment.js";
import Donation from "../models/Donation.js";

export async function getAdminStats(req, res) {
  try {
    await connectDB();

    const [
      ordersCount,
      customersCount,
      pendingConsultations,
      pendingTickets,
      orders,
      recentConsultations,
      recentTickets,
      enrollments,
      donations,
      dueOrders,
      dueEnrollments,
    ] = await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: "customer" }),
      Consultation.countDocuments({ status: "pending" }),
      Ticket.countDocuments({ status: "New" }),
      Order.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      Consultation.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Ticket.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Enrollment.find({ paymentStatus: "paid" }).lean(),
      Donation.find({ paymentStatus: "paid" }).sort({ createdAt: -1 }).limit(6).lean(),
      Order.find({ $or: [{ dueAmount: { $gt: 0 } }, { paymentStatus: "partial" }] }).select("dueAmount total paidAmount").lean(),
      Enrollment.find({ $or: [{ dueAmount: { $gt: 0 } }, { paymentStatus: "partial" }] }).select("dueAmount amount paidAmount").lean(),
    ]);

    // Calculate revenue from paid orders and enrollments
    const allOrders = await Order.find({ paymentStatus: { $in: ["paid", "delivered"] } }).select("total").lean();
    const ordersRevenue = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const enrollmentsRevenue = enrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalRevenue = ordersRevenue + enrollmentsRevenue;

    // Calculate total due balance
    const ordersDue = dueOrders.reduce((sum, o) => sum + (Number(o.dueAmount) || Math.max(0, o.total - (o.paidAmount || 0))), 0);
    const enrollmentsDue = dueEnrollments.reduce((sum, e) => sum + (Number(e.dueAmount) || Math.max(0, e.amount - (e.paidAmount || 0))), 0);
    const totalDue = ordersDue + enrollmentsDue;

    // Total donations raised
    const allPaidDonations = await Donation.find({ paymentStatus: "paid" }).select("amount").lean();
    const totalDonationsRaised = allPaidDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    // Build monthly sales overview for the last 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthlyMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap[key] = { month: months[d.getMonth()], revenue: 0, orders: 0 };
    }

    const recentAllOrders = await Order.find({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } }).lean();
    for (const ord of recentAllOrders) {
      const d = new Date(ord.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyMap[key]) {
        monthlyMap[key].orders += 1;
        if (ord.paymentStatus === "paid" || ord.status === "delivered") {
          monthlyMap[key].revenue += Number(ord.total) || 0;
        }
      }
    }
    const salesData = Object.values(monthlyMap);

    // Aggregate top products
    const productMap = {};
    for (const ord of recentAllOrders) {
      if (Array.isArray(ord.items)) {
        for (const item of ord.items) {
          const name = item.name || item.title || "Product";
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          if (!productMap[name]) {
            productMap[name] = { name, sold: 0, revenue: 0 };
          }
          productMap[name].sold += qty;
          productMap[name].revenue += qty * price;
        }
      }
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: ordersCount,
        totalCustomers: customersCount,
        pendingEnquiries: pendingConsultations + pendingTickets,
        totalDue,
        totalDueCount: dueOrders.length + dueEnrollments.length,
        totalDonationsRaised,
      },
      salesData,
      topProducts,
      recentOrders: orders.map((o) => {
        const isPaid = o.paymentStatus === "paid" || o.status === "delivered";
        const tot = Number(o.total || 0);
        const paid = o.paidAmount !== undefined ? Number(o.paidAmount) : (isPaid ? tot : 0);
        const due = o.dueAmount !== undefined ? Number(o.dueAmount) : Math.max(0, tot - paid);
        return {
          id: o.orderNumber || String(o._id).slice(-8).toUpperCase(),
          _id: o._id,
          customer: o.customerSnapshot?.name || o.shippingAddress?.fullName || o.shippingAddress?.name || "Guest Customer",
          email: o.customerSnapshot?.email || o.shippingAddress?.email || o.shippingAddress?.phone || "—",
          product: o.items?.[0]?.name || (o.items?.length ? `${o.items.length} item(s)` : "Order items"),
          amount: tot,
          paidAmount: paid,
          dueAmount: due,
          status: (o.status || "pending").charAt(0).toUpperCase() + (o.status || "pending").slice(1),
          paymentStatus: (o.paymentStatus || "pending").charAt(0).toUpperCase() + (o.paymentStatus || "pending").slice(1),
          date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        };
      }),
      recentConsultations: recentConsultations.map((c) => ({
        id: String(c._id).slice(-6).toUpperCase(),
        _id: c._id,
        name: c.name,
        service: c.type || "Consultation",
        date: c.date ? new Date(c.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: (c.status || "pending").charAt(0).toUpperCase() + (c.status || "pending").slice(1),
      })),
      recentTickets: recentTickets.map((t) => ({
        id: t.ticketId || String(t._id).slice(-6).toUpperCase(),
        _id: t._id,
        name: t.name,
        service: t.service || "General Enquiry",
        date: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: t.status || "New",
      })),
      recentDonations: donations.map((d) => ({
        id: d.donationId,
        _id: d._id,
        name: d.donorName,
        phone: d.donorPhone,
        amount: d.amount,
        date: d.createdAt ? new Date(d.createdAt).toISOString().split("T")[0] : "",
      })),
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch dashboard stats" });
  }
}
