// Generates icon16/48/128.png for the Chrome extension from the 16x16 heart sprite.
// Pure Node: a minimal PNG encoder (zlib + CRC32), no image deps.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
  const px = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = PALETTE[SPRITE[Math.floor(y / scale)][Math.floor(x / scale)]] || PALETTE["."];
      const i = (y * size + x) * 4;
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
      px[i + 3] = c[3];
    }
  }
  return px;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function png(size) {
  const rgba = spriteRGBA(size);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size * 4; x++) raw[y * (size * 4 + 1) + 1 + x] = rgba[y * size * 4 + x];
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const here = dirname(fileURLToPath(import.meta.url));
for (const s of [16, 48, 128]) {
  writeFileSync(join(here, `icon${s}.png`), png(s));
  console.log(`wrote icon${s}.png`);
}
