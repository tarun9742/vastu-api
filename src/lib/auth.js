import { jwtVerify } from "jose";

export async function verifyToken(token) {
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function requireAdmin(req, res, next) {
  const token =
    req.cookies?.vastu_session ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token || !process.env.AUTH_SECRET) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }
    if (payload.role !== "admin") {
      return res.status(403).json({ success: false, error: "Administrator access required" });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired session" });
  }
}

export function authError(auth, res) {
  return res.status(auth.status).json({ success: false, error: auth.error });
}

export async function optionalUser(req, res, next) {
  const token =
    req.cookies?.vastu_session ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (token && process.env.AUTH_SECRET) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    } catch {}
  }
  next();
}
