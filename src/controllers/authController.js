import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { connectDB } from "../lib/dbConnect.js";
import User from "../models/User.js";
import { generateOtp, sendOtpViaApiTxt, OTP_TTL_MS } from "../lib/otp.js";

const digitsOnly = (value = "") => String(value).replace(/\D/g, "");

function setSessionCookie(res, token) {
  // Use sameSite: "none" and secure: true for production/cross-origin deployments (e.g. Vercel <-> Render)
  const isLaxOnly = process.env.COOKIE_SAME_SITE === "Lax";
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER) || Boolean(process.env.VERCEL) || !isLaxOnly;
  const sameSite = isProduction ? "none" : "lax";
  const secure = isProduction;

  res.cookie("vastu_session", token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 28800 * 1000, // 8 hours in ms
  });
}

function clearSessionCookie(res) {
  const isLaxOnly = process.env.COOKIE_SAME_SITE === "Lax";
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER) || Boolean(process.env.VERCEL) || !isLaxOnly;
  const sameSite = isProduction ? "none" : "lax";
  const secure = isProduction;

  res.clearCookie("vastu_session", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  });
}

export async function adminLogin(req, res) {
  try {
    const schema = z.object({
      email: z.string().min(1, "Email or phone is required"),
      password: z.string().min(1, "Password is required"),
    });
    const body = schema.parse(req.body);

    await connectDB();
    const identifier = body.email.trim().toLowerCase();
    const cleanDigits = digitsOnly(identifier);

    // Look up by email or phone
    const orConditions = [{ email: identifier }];
    if (cleanDigits.length >= 10) {
      orConditions.push({ phone: cleanDigits });
    }

    const user = await User.findOne({
      role: "admin",
      isActive: true,
      $or: orConditions,
    }).select("+passwordHash");

    if (!user || !user.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    if (!process.env.AUTH_SECRET) {
      return res.status(503).json({ success: false, error: "Server authentication is not configured" });
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({
      sub: String(user._id),
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    setSessionCookie(res, token);

    return res.json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        token,
      },
    });
  } catch (e) {
    return res.status(e?.issues ? 400 : 500).json({
      success: false,
      error: e?.issues?.[0]?.message || "Unable to log in",
    });
  }
}

// 1. FORGOT PASSWORD: Sends OTP to registered admin email or mobile
export async function adminForgotPassword(req, res) {
  try {
    const schema = z.object({
      email: z.string().min(1, "Enter your admin email or registered mobile"),
    });
    const body = schema.parse(req.body);
    const identifier = body.email.trim().toLowerCase();
    const cleanDigits = digitsOnly(identifier);

    await connectDB();
    const orConditions = [{ email: identifier }];
    if (cleanDigits.length >= 10) {
      orConditions.push({ phone: cleanDigits });
    }

    const user = await User.findOne({
      role: "admin",
      isActive: true,
      $or: orConditions,
    }).select("+otp +otpExpiresAt +otpAttempts");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No administrator account found matching that email or mobile number.",
      });
    }

    const otp = generateOtp();
    console.log(`[AUTH] Admin password reset OTP for ${user.email || user.phone}: ${otp}`);

    user.set("otp", otp);
    user.set("otpExpiresAt", new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
    user.set("otpAttempts", 0);
    await user.save();

    if (user.phone && process.env.APITXT_AUTH_KEY && process.env.OTP_SECRET) {
      try {
        await sendOtpViaApiTxt(user.phone, otp);
      } catch (err) {
        console.warn("SMS send failed:", err?.message);
      }
    }

    const maskedPhone = user.phone ? user.phone.replace(/(\d{2})\d+(\d{2})/, "$1******$2") : "";
    const maskedEmail = user.email ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "";

    return res.json({
      success: true,
      message: `Verification code sent to registered administrator contact (${maskedEmail || maskedPhone}).`,
      maskedContact: maskedEmail || maskedPhone,
      previewOtp: otp,
    });
  } catch (e) {
    return res.status(e?.issues ? 400 : 500).json({
      success: false,
      error: e?.issues?.[0]?.message || "Unable to send reset verification code",
    });
  }
}

// 2. VERIFY RESET PASSWORD: Validates OTP and sets the new password
export async function adminVerifyResetPassword(req, res) {
  try {
    const schema = z.object({
      email: z.string().min(1, "Email or phone is required"),
      otp: z.string().length(6, "Enter the 6-digit verification code"),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    });
    const body = schema.parse(req.body);
    const identifier = body.email.trim().toLowerCase();
    const cleanDigits = digitsOnly(identifier);

    await connectDB();
    const orConditions = [{ email: identifier }];
    if (cleanDigits.length >= 10) {
      orConditions.push({ phone: cleanDigits });
    }

    const user = await User.findOne({
      role: "admin",
      isActive: true,
      $or: orConditions,
    }).select("+otp +otpExpiresAt +otpAttempts +passwordHash");

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        error: "Verification code expired or not requested. Please request a new code.",
      });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ success: false, error: "Verification code has expired. Please request a new one." });
    }

    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please request a new code." });
    }

    user.otpAttempts = (user.otpAttempts || 0) + 1;

    const expected = Buffer.from(String(user.otp), "utf8");
    const supplied = Buffer.from(body.otp.trim(), "utf8");
    const valid = expected.length === supplied.length && timingSafeEqual(expected, supplied);

    if (!valid) {
      await user.save();
      return res.status(401).json({ success: false, error: "Incorrect verification code." });
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    user.passwordHash = passwordHash;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Admin password has been reset successfully. You can now login with your new password.",
    });
  } catch (e) {
    return res.status(e?.issues ? 400 : 500).json({
      success: false,
      error: e?.issues?.[0]?.message || "Failed to reset password",
    });
  }
}

// 3. CHANGE / RESET PASSWORD: From inside the Admin Dashboard (Authenticated)
export async function adminChangePassword(req, res) {
  try {
    const schema = z.object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    });
    const body = schema.parse(req.body);

    await connectDB();
    const user = await User.findById(req.user.sub).select("+passwordHash");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Administrator access required" });
    }

    // If an existing passwordHash exists, verify current password
    if (user.passwordHash) {
      if (!body.currentPassword) {
        return res.status(400).json({ success: false, error: "Current password is required" });
      }
      const match = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!match) {
        return res.status(401).json({ success: false, error: "Current password is incorrect" });
      }
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    return res.json({
      success: true,
      message: "Admin password updated successfully!",
    });
  } catch (e) {
    return res.status(e?.issues ? 400 : 500).json({
      success: false,
      error: e?.issues?.[0]?.message || "Failed to update password",
    });
  }
}

export async function bootstrapAdmin(req, res) {
  const key = req.headers["x-bootstrap-key"];
  if (!process.env.ADMIN_BOOTSTRAP_KEY || !key || key !== process.env.ADMIN_BOOTSTRAP_KEY) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(12),
    });
    const body = schema.parse(req.body);

    await connectDB();
    if (await User.exists({ role: "admin" })) {
      return res.status(409).json({ success: false, error: "An admin already exists; bootstrap is closed" });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "First admin created. Remove ADMIN_BOOTSTRAP_KEY after setup.",
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    return res.status(e?.issues ? 400 : e?.code === 11000 ? 409 : 500).json({
      success: false,
      error: e?.issues?.[0]?.message || (e?.code === 11000 ? "Email already exists" : "Unable to create admin"),
    });
  }
}

export async function logout(req, res) {
  clearSessionCookie(res);
  return res.json({ success: true, message: "Logged out" });
}

export async function getMe(req, res) {
  const token =
    req.cookies?.vastu_session ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token || !process.env.AUTH_SECRET) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return res.json({
      success: true,
      data: {
        id: payload.sub,
        email: payload.email,
        phone: payload.phone,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch {
    return res.status(401).json({ success: false, error: "Session expired" });
  }
}

export async function sendOtp(req, res) {
  try {
    const phone = String(req.body?.phone ?? "").replace(/\D/g, "");

    // Validate Indian mobile number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    await connectDB();

    let user = await User.findOne({ phone }).select("+otp +otpExpiresAt +otpAttempts");

    if (!user) {
      user = new User({
        phone,
        role: "customer",
      });
    }

    const otp = generateOtp();
    console.log("Generated OTP for", phone, ":", otp);

    user.set("otp", otp);
    user.set("otpExpiresAt", new Date(Date.now() + OTP_TTL_MS));
    user.set("otpAttempts", 0);

    if (process.env.APITXT_AUTH_KEY && process.env.OTP_SECRET) {
      try {
        await sendOtpViaApiTxt(phone, otp);
      } catch (err) {
        console.warn("APITxT send failed (fallback to console OTP):", err?.message);
      }
    }

    await user.save();

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP failed:", error);
    return res.status(502).json({ message: "Unable to send OTP. Please try again." });
  }
}

export async function verifyOtp(req, res) {
  try {
    const schema = z.object({
      phone: z.string().transform((value) => value.replace(/\D/g, "")).pipe(
        z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number")
      ),
      code: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    const { phone, code } = parsed.data;
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return res.status(503).json({ success: false, error: "Authentication is not configured" });
    }

    await connectDB();

    const user = await User.findOne({ phone }).select("+otp +otpExpiresAt +otpAttempts");

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "Request a new OTP" });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({ success: false, error: "OTP expired. Request a new one." });
    }

    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, error: "Too many attempts. Request a new OTP." });
    }

    user.otpAttempts = (user.otpAttempts || 0) + 1;

    const expected = Buffer.from(String(user.otp), "utf8");
    const supplied = Buffer.from(code, "utf8");

    const valid = expected.length === supplied.length && timingSafeEqual(expected, supplied);

    if (!valid) {
      if (user.otpAttempts >= 5) {
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.otpAttempts = 0;
      }

      await user.save();
      return res.status(401).json({ success: false, error: "Incorrect OTP" });
    }

    // Consume the OTP so it cannot be reused.
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.mobileVerified = true;

    const adminMobile = digitsOnly(process.env.ADMIN_MOBILE || "8690708302");
    user.role = phone === adminMobile ? "admin" : (user.role === "admin" ? "admin" : "customer");
    user.isActive = true;

    await user.save();

    const token = await new SignJWT({
      sub: String(user._id),
      phone: user.phone,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(secret));

    setSessionCookie(res, token);

    return res.json({
      success: true,
      token,
      data: {
        id: String(user._id),
        phone: user.phone,
        role: user.role,
        token,
      },
      redirectTo: user.role === "admin" ? "/admin" : "/",
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return res.status(500).json({ success: false, error: "Unable to verify mobile number" });
  }
}
