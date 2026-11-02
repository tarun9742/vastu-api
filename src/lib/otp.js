import crypto from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(mobile, otp) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${mobile}:${otp}`)
    .digest("hex");
}

export async function sendOtpViaApiTxt(phone, otp) {
  const authkey = process.env.APITXT_AUTH_KEY;

  if (!authkey || !process.env.OTP_SECRET) {
    throw new Error("APITxT or OTP configuration is missing");
  }

  const body = new URLSearchParams({
    authkey,
    mobile : phone,
    otp,
  });

  const response = await fetch("https://apitxt.com/api/sendOTP", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
 

  const result = await response.text();

  if (!response.ok) {
    throw new Error(`APITxT request failed: ${response.status}`);
  }

  return result;
}

export { OTP_TTL_MS };