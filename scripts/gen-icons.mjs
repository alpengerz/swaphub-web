import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const svg = fs.readFileSync(path.join(root, "public", "favicon.svg"));

async function writePng(size, name) {
  const buf = await sharp(svg).resize(size, size).png().toBuffer();
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name);
}

await writePng(180, "apple-touch-icon.png");
await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");
await writePng(512, "maskable-512.png");
console.log("done");
