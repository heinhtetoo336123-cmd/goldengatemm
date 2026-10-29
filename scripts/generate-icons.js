import fs from 'fs';
import path from 'path';

// Valid 1x1 gold/dark blue PNG base64 to ensure no 404s when browser requests icon PNGs
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const files = [
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png',
  'apple-touch-icon.png',
  'favicon.ico'
];

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buffer);
    console.log(`Created ${file}`);
  }
});
