import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import blogRoutes from "./blogRoutes.js";
import trainingRoutes from "./trainingRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import adminRoutes from "./adminRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import donationRoutes from "./donationRoutes.js";
import serviceRoutes from "./serviceRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/services", serviceRoutes);
apiRouter.use("/blog", blogRoutes);
apiRouter.use("/training", trainingRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/uploads", uploadRoutes);
apiRouter.use("/appointment", appointmentRoutes);
apiRouter.use("/appointments", appointmentRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/donations", donationRoutes);
apiRouter.use("/contact", ticketRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/admin", adminRoutes);

export default apiRouter;
