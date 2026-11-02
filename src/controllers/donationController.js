import { connectDB } from "../lib/dbConnect.js";
import Donation from "../models/Donation.js";
import { generatePayUHash, verifyPayUResponse } from "../lib/payu.js";

export async function initiateDonation(req, res) {
  try {
    const { donorName, donorPhone, donorEmail, amount, pan, message } = req.body || {};

    if (!donorName?.trim() || !donorPhone?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Donor name and phone number are required",
      });
    }

    const numAmount = Math.max(1, Number(amount) || 0);
    const cleanedPhone = donorPhone.replace(/\D/g, "").slice(-10);
    if (cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid 10-digit mobile number",
      });
    }

    await connectDB();
    const donationId = `BSV-NGO-${Date.now().toString().slice(-6)}`;
    const txnid = `TXN_DON_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const donation = await Donation.create({
      donationId,
      donorName: donorName.trim(),
      donorPhone: cleanedPhone,
      donorEmail: (donorEmail || "").trim(),
      amount: numAmount,
      purpose: "Choti Khushi NGO - Feeding Work for Birds",
      pan: (pan || "").trim(),
      message: (message || "").trim(),
      txnid,
      paymentStatus: "pending",
      paymentProvider: "payu",
    });

    const key = process.env.PAYU_KEY || "m6wAnh";
    const surl = process.env.PAYU_SUCCESS_URL || "http://localhost:3001/api/payments/payu/response";
    const furl = process.env.PAYU_FAILURE_URL || "http://localhost:3001/api/payments/payu/response";

    const hash = generatePayUHash({
      txnid,
      amount: numAmount,
      productinfo: "Choti Khushi NGO Bird Feeding",
      firstname: donorName.trim(),
      email: (donorEmail || "donor@example.com").trim(),
      udf1: donationId,
      udf2: "donation",
    });

    return res.json({
      success: true,
      donationId,
      txnid,
      actionUrl: "https://test.payu.in/_payment",
      payuParams: {
        key,
        txnid,
        amount: numAmount.toFixed(2),
        productinfo: "Choti Khushi NGO Bird Feeding",
        firstname: donorName.trim(),
        email: (donorEmail || "donor@example.com").trim(),
        phone: cleanedPhone,
        surl,
        furl,
        hash,
        udf1: donationId,
        udf2: "donation",
      },
    });
  } catch (error) {
    console.error("initiateDonation error:", error);
    return res.status(500).json({ success: false, error: "Unable to initiate donation" });
  }
}

export async function getMyDonations(req, res) {
  try {
    await connectDB();
    const userPhone = req.user?.phone || req.query.phone;
    if (!userPhone) {
      return res.json({ success: true, data: [] });
    }

    const cleaned = userPhone.replace(/\D/g, "").slice(-10);
    const data = await Donation.find({
      donorPhone: cleaned,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getMyDonations error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch donations" });
  }
}

export async function getAdminDonations(req, res) {
  try {
    await connectDB();
    const data = await Donation.find({}).sort({ createdAt: -1 }).lean();

    const paidDonations = data.filter((d) => d.paymentStatus === "paid");
    const totalRaised = paidDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return res.json({
      success: true,
      data,
      stats: {
        totalDonations: data.length,
        paidCount: paidDonations.length,
        totalRaised,
      },
    });
  } catch (error) {
    console.error("getAdminDonations error:", error);
    return res.status(500).json({ success: false, error: "Unable to fetch admin donations" });
  }
}
