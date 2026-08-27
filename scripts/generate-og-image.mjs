import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../public/og-image.png");

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A0C3FD"/>
      <stop offset="100%" style="stop-color:#FFE79C"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width / 2}" y="${height / 2 - 20}" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#191c1e" text-anchor="middle" dominant-baseline="middle">NexaFx</text>
  <text x="${width / 2}" y="${height / 2 + 50}" font-family="Arial, sans-serif" font-size="28" fill="#444" text-anchor="middle" dominant-baseline="middle">Multi-Currency Finance on Stellar</text>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(width, height)
  .png()
  .toFile(outputPath);

console.log(`OG image generated at ${outputPath}`);
