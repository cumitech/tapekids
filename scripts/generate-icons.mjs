import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "cross-logo.png");
const PUBLIC_DIR = path.join(ROOT, "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");

const PAPER = { r: 246, g: 243, b: 238, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const PNG_SIZES = [48, 72, 96, 128, 144, 152, 180, 192, 384, 512];

async function logoOnCanvas(size, paddingRatio) {
  const pad = Math.round(size * paddingRatio);
  const inner = Math.max(1, size - pad * 2);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: PAPER,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

function encodeIco(images) {
  const headerSize = 6 + 16 * images.length;
  const payloadSize = images.reduce((sum, image) => sum + image.buffer.length, 0);
  const out = Buffer.alloc(headerSize + payloadSize);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(images.length, 4);

  let offset = headerSize;
  let entry = 6;
  for (const image of images) {
    out[entry] = image.size >= 256 ? 0 : image.size;
    out[entry + 1] = image.size >= 256 ? 0 : image.size;
    out[entry + 2] = 0;
    out[entry + 3] = 0;
    out.writeUInt16LE(1, entry + 4);
    out.writeUInt16LE(32, entry + 6);
    out.writeUInt32LE(image.buffer.length, entry + 8);
    out.writeUInt32LE(offset, entry + 12);
    image.buffer.copy(out, offset);
    offset += image.buffer.length;
    entry += 16;
  }
  return out;
}

function svgDocument(png) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Kids Events Cameroon">
  <image width="256" height="256" href="data:image/png;base64,${png.toString("base64")}"/>
</svg>
`;
}

async function writePng(filePath, buffer) {
  await writeFile(filePath, buffer);
  console.log("wrote", path.relative(ROOT, filePath));
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  const favicon16 = await logoOnCanvas(16, 0.05);
  const favicon32 = await logoOnCanvas(32, 0.05);
  const favicon48 = await logoOnCanvas(48, 0.05);
  const apple = await logoOnCanvas(180, 0.05);
  const mstile = await logoOnCanvas(150, 0.11);

  await writePng(path.join(PUBLIC_DIR, "favicon-16x16.png"), favicon16);
  await writePng(path.join(PUBLIC_DIR, "favicon-16.png"), favicon16);
  await writePng(path.join(PUBLIC_DIR, "favicon-32x32.png"), favicon32);
  await writePng(path.join(PUBLIC_DIR, "favicon-32.png"), favicon32);
  await writePng(path.join(PUBLIC_DIR, "apple-touch-icon.png"), apple);
  await writePng(path.join(PUBLIC_DIR, "apple-touch-icon-precomposed.png"), apple);
  await writePng(path.join(ICONS_DIR, "apple-touch-icon.png"), apple);
  await writePng(path.join(ICONS_DIR, "mstile-150.png"), mstile);

  for (const size of PNG_SIZES) {
    const buffer = await logoOnCanvas(size, 0.05);
    await writePng(path.join(ICONS_DIR, `icon-${size}.png`), buffer);
  }

  const maskable192 = await logoOnCanvas(192, 0.17);
  const maskable512 = await logoOnCanvas(512, 0.17);
  await writePng(path.join(ICONS_DIR, "icon-192-maskable.png"), maskable192);
  await writePng(path.join(ICONS_DIR, "icon-512-maskable.png"), maskable512);

  const ico = encodeIco([
    { size: 16, buffer: favicon16 },
    { size: 32, buffer: favicon32 },
    { size: 48, buffer: favicon48 },
  ]);
  await writeFile(path.join(PUBLIC_DIR, "favicon.ico"), ico);
  console.log("wrote public/favicon.ico");

  const svg = svgDocument(await logoOnCanvas(256, 0.05));
  await writeFile(path.join(PUBLIC_DIR, "favicon.svg"), svg);
  await writeFile(path.join(ICONS_DIR, "icon.svg"), svg);
  await writeFile(path.join(PUBLIC_DIR, "logo-v3.svg"), svg);
  console.log("wrote public/favicon.svg");
  console.log("wrote public/icons/icon.svg");
  console.log("wrote public/logo-v3.svg");

  await sharp(SRC).png().toFile(path.join(PUBLIC_DIR, "logo.png"));
  console.log("wrote public/logo.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
