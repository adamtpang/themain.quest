// Generates app/favicon.ico (16/32/48) and app/icon.svg from one 16x16 sprite.
// Pixel art: a candy-red HP heart with bubblegum highlight. No image deps, no AA.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// . transparent  o ink outline  R red  P bubblegum  W shine
const SPRITE = [
  "................",
  "...ooo....ooo...",
  "..oRRRo..oRRRo..",
  ".oRRRRRRRRRRRRo.",
  ".oRRPRRRRRRRRRo.",
  ".oRPWRRRRRRRRRo.",
  ".oRRRRRRRRRRRRo.",
  "..oRRRRRRRRRRo..",
  "...oRRRRRRRRo...",
  "....oRRRRRRo....",
  ".....oRRRRo.....",
  "......oRRo......",
  ".......oo.......",
  "................",
  "................",
  "................",
];

const PALETTE = {
  o: [0x24, 0x1b, 0x40, 255],
  R: [0xff, 0x5d, 0x5d, 255],
  P: [0xff, 0x9e, 0xc7, 255],
  W: [0xff, 0xff, 0xff, 255],
  ".": [0, 0, 0, 0],
};

const N = 16;

function spriteRGBA(size) {
  const scale = size / N;
  const px = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const ch = SPRITE[sy][sx];
      const c = PALETTE[ch] || PALETTE["."];
      const i = (y * size + x) * 4;
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
      px[i + 3] = c[3];
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
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(xorSize, 20);
  const xor = Buffer.alloc(xorSize);
  const and = Buffer.alloc(andSize);
  for (let y = 0; y < size; y++) {
    const dstY = size - 1 - y;
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
  const images = sizes.map((s) => bmpForIco(spriteRGBA(s), s));
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

function buildSvg() {
  const hex = (c) => "#" + c.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");
  let rects = "";
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const ch = SPRITE[y][x];
      if (ch === ".") continue;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${hex(PALETTE[ch])}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">${rects}</svg>\n`;
}

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, "..", "app", "favicon.ico"), buildIco([16, 32, 48]));
writeFileSync(join(here, "..", "app", "icon.svg"), buildSvg());
console.log("wrote app/favicon.ico and app/icon.svg");
