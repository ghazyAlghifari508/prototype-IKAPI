// P04: where do the differing pixels live? Prints the bounding boxes of diff clusters (rows) for a pair of PNGs.
// Usage: node docs/migration/tools/diff-locate.mjs <proto.png> <blade.png>
import fs from 'node:fs';
import zlib from 'node:zlib';

function decode(file) {
  const buf = fs.readFileSync(file); let off = 8, w = 0, h = 0, type = 0; const idat = [];
  while (off < buf.length) { const len = buf.readUInt32BE(off); const name = buf.toString('ascii', off + 4, off + 8); const data = buf.subarray(off + 8, off + 8 + len); if (name === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; } else if (name === 'IDAT') idat.push(data); else if (name === 'IEND') break; off += 12 + len; }
  const ch = { 2: 3, 6: 4, 0: 1, 4: 2 }[type]; const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * ch; const out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride), pos = 0;
  for (let y = 0; y < h; y++) { const f = raw[pos++]; const line = Buffer.from(raw.subarray(pos, pos + stride)); pos += stride;
    for (let x = 0; x < stride; x++) { const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0; let v = line[x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; } line[x] = v & 255; }
    for (let x = 0; x < w; x++) { const s = x * ch, d = (y * w + x) * 4; out[d] = line[s]; out[d + 1] = type === 0 || type === 4 ? line[s] : line[s + 1]; out[d + 2] = type === 0 || type === 4 ? line[s] : line[s + 2]; out[d + 3] = 255; }
    prev = line; }
  return { w, h, data: out };
}

const [a, b] = process.argv.slice(2);
const A = decode(a), B = decode(b);
const rows = new Map(); let maxDelta = 0, total = 0;
for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const i = (y * A.w + x) * 4; const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])); if (d > 0) { total++; maxDelta = Math.max(maxDelta, d); const r = rows.get(y) ?? { n: 0, x0: x, x1: x }; r.n++; r.x0 = Math.min(r.x0, x); r.x1 = Math.max(r.x1, x); rows.set(y, r); } }
const ys = [...rows.keys()].sort((p, q) => p - q);
const bands = []; for (const y of ys) { const last = bands[bands.length - 1]; if (last && y - last.y1 <= 2) { last.y1 = y; last.n += rows.get(y).n; last.x0 = Math.min(last.x0, rows.get(y).x0); last.x1 = Math.max(last.x1, rows.get(y).x1); } else bands.push({ y0: y, y1: y, n: rows.get(y).n, x0: rows.get(y).x0, x1: rows.get(y).x1 }); }
console.log(JSON.stringify({ total, maxChannelDelta: maxDelta, bands: bands.slice(0, 12) }));
