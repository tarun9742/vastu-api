import { Router } from "express";
import {
  adminLogin,
  adminForgotPassword,
  adminVerifyResetPassword,
  adminChangePassword,
  bootstrapAdmin,
  logout,
  getMe,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

// Admin Authentication Endpoints
router.post("/admin-login", adminLogin);
router.post("/admin/forgot-password", adminForgotPassword);
router.post("/admin/verify-reset-password", adminVerifyResetPassword);
router.post("/admin/change-password", requireAdmin, adminChangePassword);
router.post("/admin/reset-password", requireAdmin, adminChangePassword);

// Setup & General Auth
router.post("/bootstrap-admin", bootstrapAdmin);
router.post("/logout", logout);
router.get("/me", getMe);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

export default router;
