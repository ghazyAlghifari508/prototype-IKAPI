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
const y = 489;
const ink = (img, x0, x1) => { const s = []; for (let x = x0; x < x1; x++) { const i = (y * img.w + x) * 4; s.push(img.data[i] < 200 ? '#' : (img.data[i] < 250 ? '+' : '.')); } return s.join(''); };
console.log('proto:', ink(A, 120, 200));
console.log('blade:', ink(B, 120, 200));
console.log('proto2:', ink(A, 120, 200).replace(/./g, (c, i) => c));
// row above/below to detect vertical shift
for (const yy of [486, 488, 490, 492]) {
  const ink2 = (img) => { let s = ''; for (let x = 120; x < 200; x++) { const i = (yy * img.w + x) * 4; s += img.data[i] < 200 ? '#' : (img.data[i] < 250 ? '+' : '.'); } return s; };
  console.log(`y=${yy} proto:`, ink2(A));
  console.log(`y=${yy} blade:`, ink2(B));
}
