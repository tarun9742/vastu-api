import { connectDB } from "../lib/dbConnect.js";

export async function getHealth(req, res) {
  try {
    await connectDB();
    return res.json({
      success: true,
      service: "vastu-api",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(503).json({
      success: false,
      service: "vastu-api",
      database: "disconnected",
      error: "Database connection failed",
    });
  }
}
