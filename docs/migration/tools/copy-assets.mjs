// P03 asset publication - copies docs/design/assets/** to public/assets/ikapi/** byte-for-byte.
// Originals are never moved, renamed or rewritten. Writes docs/migration/p3-assets.json (mapping + hashes).
// Usage: node docs/migration/tools/copy-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const REPO = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const SRC = path.join(REPO, 'docs/design/assets');
const DST = path.join(REPO, 'public/assets/ikapi');
const MAP = path.join(REPO, 'docs/migration/p3-assets.json');

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, '/'));
  }
  return out;
}

const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function dims(buf, ext) {
  try {
    if (ext === 'png') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === 'svg') {
      const head = buf.toString('utf8', 0, 2000);
      const w = /width="([\d.]+)/.exec(head), h = /height="([\d.]+)/.exec(head);
      const vb = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/.exec(head);
      return { w: w ? Number(w[1]) : (vb ? Number(vb[1]) : null), h: h ? Number(h[1]) : (vb ? Number(vb[2]) : null) };
    }
    if (ext === 'jpg' || ext === 'jpeg') {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch { /* dimension probing is best effort */ }
  return { w: null, h: null };
}

const files = walk(SRC).sort();
const rows = [];
let copied = 0, identical = 0, mismatch = 0;

for (const rel of files) {
  const from = path.join(SRC, rel);
  const to = path.join(DST, rel);
  const srcBuf = fs.readFileSync(from);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, srcBuf);
  copied++;
  const dstBuf = fs.readFileSync(to);
  const same = md5(srcBuf) === md5(dstBuf);
  if (same) identical++; else mismatch++;
  const ext = rel.split('.').pop().toLowerCase();
  const d = dims(srcBuf, ext);
  rows.push({
    source: `docs/design/assets/${rel}`,
    public: `public/assets/ikapi/${rel}`,
    url: `assets/ikapi/${rel}`,
    md5: md5(srcBuf),
    sha256: sha256(srcBuf).slice(0, 16),
    bytes: srcBuf.length,
    ...d,
    note: /[ A-Z]/.test(rel) ? 'nama berisi spasi/huruf besar; dipertahankan apa adanya, pakai asset() agar di-encode' : null,
  });
}

fs.writeFileSync(MAP, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'docs/design/assets',
  destination: 'public/assets/ikapi',
  total: rows.length,
  copied,
  hashIdentical: identical,
  hashMismatch: mismatch,
  files: rows,
}, null, 1));

console.log(JSON.stringify({ total: rows.length, copied, hashIdentical: identical, hashMismatch: mismatch }));
console.log('with spaces/uppercase:', rows.filter((r) => r.note).length);
console.log('by folder:', Object.entries(rows.reduce((a, r) => { const k = r.source.replace('docs/design/assets/', '').split('/')[0]; a[k] = (a[k] || 0) + 1; return a; }, {})));