import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";

const app = express();
 
const corsOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,http://localhost:5173,https://vastu-user.vercel.app,https://vastu-admin-nine.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow explicitly configured origins
      if (corsOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      // Allow localhost and 127.0.0.1 on any port
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Reject unapproved origins
      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Bootstrap-Key",
    ],
  })
); 

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Root welcome / health check info
app.get("/", (req, res) => {
  res.json({
    name: "vastu-api",
    description: "Backend service for Bhuwneshwari Scientific Vastu",
    status: "online",
    healthCheck: "/api/health",
  });
});

// Mount all API routes
app.use("/api", apiRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

export default app;
