import { Router } from "express";
import { requireAdmin } from "../lib/auth.js";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../controllers/productController.js";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "../controllers/consultationController.js";
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from "../controllers/serviceController.js";
import {
  getAdminOrders,
  getAdminOrderById,
  createAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
  recordAdminOrderPayment,
  getAdminDuePayments,
} from "../controllers/orderController.js";
import {
  getAdminCustomers,
  updateAdminCustomer,
  deleteAdminCustomer,
} from "../controllers/customerController.js";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/settingsController.js";
import {
  getAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
} from "../controllers/blogController.js";
import {
  getAdminTrainings,
  createAdminTraining,
  updateAdminTraining,
  deleteAdminTraining,
} from "../controllers/trainingController.js";
import {
  getAdminEnrollments,
  createAdminEnrollment,
  recordAdminEnrollmentPayment,
} from "../controllers/paymentController.js";
import {
  getAdminTickets,
  updateAdminTicket,
  deleteAdminTicket,
} from "../controllers/ticketController.js";
import { getAdminStats } from "../controllers/statsController.js";
import { getAdminDonations } from "../controllers/donationController.js";

const router = Router();

// Protect all admin routes with requireAdmin middleware
router.use(requireAdmin);

// Dashboard overview stats
router.get("/stats", getAdminStats);

// Due payments (Orders & Training)
router.get("/due-payments", getAdminDuePayments);

// Products
router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

// Services (Vastu Consultations Catalog)
router.get("/services", getAdminServices);
router.post("/services", createAdminService);
router.patch("/services/:id", updateAdminService);
router.delete("/services/:id", deleteAdminService);

// Consultations
router.get("/consultations", getConsultations);
router.post("/consultations", createConsultation);
router.patch("/consultations/:id", updateConsultation);
router.delete("/consultations/:id", deleteConsultation);

// Orders
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderById);
router.post("/orders", createAdminOrder);
router.patch("/orders/:id", updateAdminOrder);
router.post("/orders/:id/record-payment", recordAdminOrderPayment);
router.delete("/orders/:id", deleteAdminOrder);

// Customers
router.get("/customers", getAdminCustomers);
router.patch("/customers/:id", updateAdminCustomer);
router.delete("/customers/:id", deleteAdminCustomer);

// Tickets / Enquiries
router.get("/tickets", getAdminTickets);
router.patch("/tickets/:id", updateAdminTicket);
router.delete("/tickets/:id", deleteAdminTicket);

// Settings
router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

// Blog
router.get("/blog", getAdminBlogPosts);
router.post("/blog", createAdminBlogPost);
router.patch("/blog/:id", updateAdminBlogPost);
router.delete("/blog/:id", deleteAdminBlogPost);

// Training & Enrollments
router.get("/training", getAdminTrainings);
router.post("/training", createAdminTraining);
router.patch("/training/:id", updateAdminTraining);
router.delete("/training/:id", deleteAdminTraining);
router.get("/enrollments", getAdminEnrollments);
router.post("/enrollments", createAdminEnrollment);
router.post("/enrollments/:id/record-payment", recordAdminEnrollmentPayment);

// NGO Donations
router.get("/donations", getAdminDonations);

export default router;
