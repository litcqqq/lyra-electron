/**
 * Generates assets/icon.png (16x16 solid indigo square)
 * using only Node.js built-ins (no extra deps).
 * Run once: node scripts/make-icon.js
 */

const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE  = 16;
const R = 0x63, G = 0x66, B = 0xf1, A = 0xff; // #6366f1

// ── helpers ──────────────────────────────────────────────────────────────────
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeB = Buffer.from(type, "ascii");
  const len   = u32(data.length);
  const crcIn = Buffer.concat([typeB, data]);
  return Buffer.concat([len, typeB, data, u32(crc32(crcIn))]);
}

// ── build raw RGBA scanlines (filter byte 0 = None per row) ──────────────────
const rawRows = [];
for (let y = 0; y < SIZE; y++) {
  const row = Buffer.alloc(1 + SIZE * 4);   // 1 filter byte + RGBA pixels
  row[0] = 0;
  for (let x = 0; x < SIZE; x++) {
    const off = 1 + x * 4;
    row[off]     = R;
    row[off + 1] = G;
    row[off + 2] = B;
    row[off + 3] = A;
  }
  rawRows.push(row);
}
const raw = Buffer.concat(rawRows);

// ── PNG signature ─────────────────────────────────────────────────────────────
const SIG  = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);

// ── IHDR: width, height, 8-bit, RGBA (color type 6) ─────────────────────────
const ihdrData = Buffer.concat([
  u32(SIZE), u32(SIZE),
  Buffer.from([8, 6, 0, 0, 0])   // bit depth, color type, compress, filter, interlace
]);

// ── IDAT: zlib-deflate the raw scanlines ─────────────────────────────────────
const idatData = zlib.deflateSync(raw, { level: 9 });

// ── assemble ──────────────────────────────────────────────────────────────────
const png = Buffer.concat([
  SIG,
  chunk("IHDR", ihdrData),
  chunk("IDAT", idatData),
  chunk("IEND", Buffer.alloc(0)),
]);

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "icon.png"), png);
console.log("✓ assets/icon.png generated");
