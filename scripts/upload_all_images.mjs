import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'opcwb3mh',
  api_key: '537267975364444',
  api_secret: '9gASS_zPq_hCIs9Zh68fjtBoEBo',
});

const uploadCacheFile = 'C:/Users/tsoni/Desktop/vastu/cloudinary_uploads.json';
let cache = {};
if (fs.existsSync(uploadCacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(uploadCacheFile, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

const uniqueImages = JSON.parse(
  fs.readFileSync('C:/Users/tsoni/Desktop/vastu/unique_images.json', 'utf8')
);

console.log(`Starting Cloudinary upload for ${uniqueImages.length} images...`);

async function uploadAll() {
  const baseDir = 'C:/Users/tsoni/Desktop/vastu/product_images';
  let uploadedCount = 0;

  for (let i = 0; i < uniqueImages.length; i++) {
    const filename = uniqueImages[i];
    if (cache[filename] && cache[filename].url) {
      console.log(`[${i + 1}/${uniqueImages.length}] Already cached: ${filename}`);
      continue;
    }

    const fullPath = path.join(baseDir, filename);
    console.log(`[${i + 1}/${uniqueImages.length}] Uploading ${filename}...`);
    try {
      const res = await cloudinary.uploader.upload(fullPath, {
        folder: 'vastu_products',
        resource_type: 'image',
      });
      cache[filename] = {
        url: res.secure_url,
        publicId: res.public_id,
        bytes: res.bytes,
        format: res.format,
        width: res.width,
        height: res.height,
      };
      uploadedCount++;
      // Save progressively
      fs.writeFileSync(uploadCacheFile, JSON.stringify(cache, null, 2), 'utf8');
      console.log(`  -> Done: ${res.secure_url}`);
    } catch (err) {
      console.error(`  -> ERROR uploading ${filename}:`, err?.message || err);
    }
  }

  console.log(`Finished! Newly uploaded: ${uploadedCount}, Total cached: ${Object.keys(cache).length}`);
}

uploadAll();
