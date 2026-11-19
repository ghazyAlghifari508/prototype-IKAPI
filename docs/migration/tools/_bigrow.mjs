import { readFileSync } from 'node:fs';
import zlib from 'node:zlib';
function decode(file) {
  const buf = readFileSync(file); let off = 8, w = 0, h = 0, type = 0; const idat = [];
  while (off < buf.length) { const len = buf.readUInt32BE(off); const name = buf.toString('ascii', off + 4, off + 8); const data = buf.subarray(off + 8, off + 8 + len); if (name === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; } else if (name === 'IDAT') idat.push(data); else if (name === 'IEND') break; off += 12 + len; }
  const ch = { 2: 3, 6: 4, 0: 1 }[type]; const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * ch; const out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride), pos = 0;
  for (let y = 0; y < h; y++) { const f = raw[pos++]; const line = Buffer.from(raw.subarray(pos, pos + stride)); pos += stride;
    for (let x = 0; x < stride; x++) { const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0; let v = line[x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; } line[x] = v & 255; }
    for (let x = 0; x < w; x++) { const s = x * ch, d = (y * w + x) * 4; out[d] = line[s]; out[d + 1] = ch >= 3 ? line[s + 1] : line[s]; out[d + 2] = ch >= 3 ? line[s + 2] : line[s]; out[d + 3] = 255; }
    prev = line; }
  return { w, h, data: out };
}
const A = decode(process.argv[2]), B = decode(process.argv[3]);
for (const y of [485, 490, 495]) {
  const xs = [];
  for (let x = 0; x < A.w; x++) { const i = (y * A.w + x) * 4; const d = Math.max(Math.abs(A.data[i]-B.data[i]), Math.abs(A.data[i+1]-B.data[i+1]), Math.abs(A.data[i+2]-B.data[i+2])); if (d > 96) xs.push(x); }
  console.log(`y=${y}: ${xs.length} px >96 at x=`, xs.slice(0, 24).join(','));
  // also print proto/blade colours at the first 3
  for (const x of xs.slice(0, 3)) { const i = (y * A.w + x) * 4; console.log(`    x=${x} proto=${A.data[i]},${A.data[i+1]},${A.data[i+2]} blade=${B.data[i]},${B.data[i+1]},${B.data[i+2]}`); }
}
