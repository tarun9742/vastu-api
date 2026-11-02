import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = 'C:/Users/tsoni/Desktop/vastu/product_images';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

const hashes = new Map();
const uniqueFiles = [];

for (const f of files) {
  const fullPath = path.join(dir, f);
  const buf = fs.readFileSync(fullPath);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (!hashes.has(hash)) {
    hashes.set(hash, f);
    uniqueFiles.push(f);
  }
}

fs.writeFileSync(
  'C:/Users/tsoni/Desktop/vastu/unique_images.json',
  JSON.stringify(uniqueFiles, null, 2),
  'utf8'
);
console.log('Unique images count:', uniqueFiles.length);
