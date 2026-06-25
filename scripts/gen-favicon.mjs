// Generates app/favicon.ico (16/32/48) with no image deps.
// Mark: gold quest-target ring + center dot on a dark rounded square.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DARK = [0x0d, 0x10, 0x18]; // #0d1018 panel
const GOLD = [0xff, 0xcf, 0x4a]; // #ffcf4a

function roundedRectInside(x, y, size, rad) {
  const minX = rad,
    maxX = size - rad,
    minY = rad,
    maxY = size - rad;
  if (x >= minX && x <= maxX) return y >= 0 && y <= size;
  if (y >= minY && y <= maxY) return x >= 0 && x <= size;
  const cx = x < minX ? minX : maxX;
  const cy = y < minY ? minY : maxY;
  const dx = x - cx,
    dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

function renderRGBA(size) {
  const ss = 4; // supersample for anti-aliasing
  const px = new Uint8ClampedArray(size * size * 4);
  const c = size / 2;
  const ringOuter = size * 0.46;
  const ringInner = size * 0.3;
  const dot = size * 0.13;
  const rad = size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const fx = x + (sx + 0.5) / ss;
          const fy = y + (sy + 0.5) / ss;
          const dx = fx - c,
            dy = fy - c;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let col,
            al = 255;
          if (!roundedRectInside(fx, fy, size, rad)) {
            col = [0, 0, 0];
            al = 0;
          } else if (dist <= dot) {
            col = GOLD;
          } else if (dist >= ringInner && dist <= ringOuter) {
            col = GOLD;
          } else {
            col = DARK;
          }
          r += col[0] * al;
          g += col[1] * al;
          b += col[2] * al;
          a += al;
        }
      }
      const n = ss * ss;
      const idx = (y * size + x) * 4;
      if (a <= 0) {
        px[idx] = px[idx + 1] = px[idx + 2] = px[idx + 3] = 0;
      } else {
        px[idx] = Math.round(r / a);
        px[idx + 1] = Math.round(g / a);
        px[idx + 2] = Math.round(b / a);
        px[idx + 3] = Math.round(a / n);
      }
    }
  }
  return px;
}

function bmpForIco(px, size) {
  const rowXor = size * 4;
  const xorSize = rowXor * size;
  const andRow = Math.ceil(size / 32) * 4;
  const andSize = andRow * size;
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8); // xor + and masks
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16); // BI_RGB
  header.writeUInt32LE(xorSize, 20);
  const xor = Buffer.alloc(xorSize);
  const and = Buffer.alloc(andSize);
  for (let y = 0; y < size; y++) {
    const dstY = size - 1 - y; // bottom-up
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      const d = dstY * rowXor + x * 4;
      const R = px[s],
        G = px[s + 1],
        B = px[s + 2],
        A = px[s + 3];
      xor[d] = B;
      xor[d + 1] = G;
      xor[d + 2] = R;
      xor[d + 3] = A;
      if (A === 0) and[dstY * andRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return Buffer.concat([header, xor, and]);
}

function buildIco(sizes) {
  const images = sizes.map((s) => bmpForIco(renderRGBA(s), s));
  const count = sizes.length;
  const dir = Buffer.alloc(6 + 16 * count);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    const s = sizes[i];
    dir.writeUInt8(s >= 256 ? 0 : s, e + 0);
    dir.writeUInt8(s >= 256 ? 0 : s, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(img.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += img.length;
  });
  return Buffer.concat([dir, ...images]);
}

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "app", "favicon.ico");
writeFileSync(out, buildIco([16, 32, 48]));
console.log("wrote", out);
