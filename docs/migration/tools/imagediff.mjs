// P02 visual diff tool (no dependencies): decode two PNGs, report differing pixels, optionally write a diff overlay.
// Usage: node docs/migration/tools/imagediff.mjs <a.png> <b.png> [out.png] [--threshold=0] [--tolerance=0]
//
// Tolerance policy (documented in p2-visual-baseline.md):
//   --threshold  channel delta that still counts as "same" (0 = exact bytes)
//   anti-aliasing of text is the only accepted source of noise, and it still must be reviewed as a diff image.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return (buf) => { let c = -1; for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();

function decode(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8, w = 0, h = 0, depth = 0, type = 0, interlace = 0;
  const idat = [];
  const palette = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const name = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (name === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12]; }
    else if (name === 'PLTE') { for (let i = 0; i < len; i += 3) palette.push([data[i], data[i + 1], data[i + 2]]); }
    else if (name === 'IDAT') idat.push(data);
    else if (name === 'IEND') break;
    off += 12 + len;
  }
  if (depth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth=${depth}, interlace=${interlace})`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  if (!channels) throw new Error('unsupported color type ' + type);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = Buffer.from(raw.subarray(pos, pos + stride)); pos += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = v & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const s = x * channels, d = (y * w + x) * 4;
      if (type === 6) { out[d] = line[s]; out[d + 1] = line[s + 1]; out[d + 2] = line[s + 2]; out[d + 3] = line[s + 3]; }
      else if (type === 2) { out[d] = line[s]; out[d + 1] = line[s + 1]; out[d + 2] = line[s + 2]; out[d + 3] = 255; }
      else if (type === 0) { out[d] = out[d + 1] = out[d + 2] = line[s]; out[d + 3] = 255; }
      else if (type === 4) { out[d] = out[d + 1] = out[d + 2] = line[s]; out[d + 3] = line[s + 1]; }
      else if (type === 3) { const p = palette[line[s]] ?? [0, 0, 0]; out[d] = p[0]; out[d + 1] = p[1]; out[d + 2] = p[2]; out[d + 3] = 255; }
    }
    prev = line;
  }
  return { w, h, data: out };
}

export { decode };

function encode(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const chunk = (name, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(name, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

export function diff(a, b, opts = {}) {
  const A = decode(a), B = decode(b);
  if (A.w !== B.w || A.h !== B.h) return { a, b, sizeMismatch: true, aSize: [A.w, A.h], bSize: [B.w, B.h], diffPixels: A.w * A.h, ratio: 1 };
  const thr = opts.threshold ?? 0;
  const out = Buffer.alloc(A.data.length);
  let diffPixels = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
    if (d > thr) {
      diffPixels++;
      out[i] = 255; out[i + 1] = 0; out[i + 2] = 255; out[i + 3] = 255;
    } else {
      const g = (A.data[i] + A.data[i + 1] + A.data[i + 2]) / 3;
      const v = 235 + g * 0.08;
      out[i] = out[i + 1] = out[i + 2] = v; out[i + 3] = 255;
    }
  }
  if (opts.out) fs.writeFileSync(opts.out, encode(A.w, A.h, out));
  return { a, b, w: A.w, h: A.h, diffPixels, totalPixels: A.w * A.h, ratio: diffPixels / (A.w * A.h) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2).filter((x) => !x.startsWith('--'));
  const flags = Object.fromEntries(process.argv.slice(2).filter((x) => x.startsWith('--')).map((x) => x.replace(/^--/, '').split('=')));
  const [a, b, out] = args;
  if (!a || !b) { console.error('usage: imagediff.mjs <a.png> <b.png> [out.png] [--threshold=N]'); process.exit(2); }
  const r = diff(a, b, { out, threshold: Number(flags.threshold ?? 0) });
  console.log(JSON.stringify(r));
}
