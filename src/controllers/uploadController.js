import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "opcwb3mh",
  api_key: process.env.CLOUDINARY_API_KEY || "537267975364444",
  api_secret: process.env.CLOUDINARY_API_SECRET || "9gASS_zPq_hCIs9Zh68fjtBoEBo",
});

export async function signUpload(req, res) {
  const secret = process.env.CLOUDINARY_API_SECRET || "9gASS_zPq_hCIs9Zh68fjtBoEBo";
  if (!secret) {
    return res.status(503).json({ success: false, error: "Cloudinary is not configured" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "vastu-products";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    secret
  );

  return res.json({
    success: true,
    data: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "opcwb3mh",
      apiKey: process.env.CLOUDINARY_API_KEY || "537267975364444",
      timestamp,
      folder,
      signature,
    },
  });
}

export async function uploadImage(req, res) {
  try {
    const { image, file, folder = "vastu-products" } = req.body || {};
    const imgData = image || file;

    if (!imgData) {
      return res.status(400).json({ success: false, error: "Image data is required (base64 or URL)" });
    }

    const uploadResponse = await cloudinary.uploader.upload(imgData, {
      folder,
      resource_type: "auto",
    });

    return res.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to upload image to Cloudinary",
    });
  }
}
