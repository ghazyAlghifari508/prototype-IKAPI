// P02 state verification (full-page pass): compares replayed states against the page's full-page default.
// Usage: node docs/migration/tools/verify-states-full.mjs
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const matrix = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'states-manifest-full.json'), 'utf8'));
const OUT = path.join(ROOT, 'states-verification-full.json');

const rows = [];
for (const s of states) {
  const vp = s.viewport === 'mobile' ? '390x844' : '1440x900';
  const m = matrix.find((x) => x.page === s.page && x.viewport === vp && x.files);
  if (!m) continue;
  const base = path.join(ROOT, m.files.full);
  for (const scr of s.screens ?? []) {
    const file = path.join(ROOT, scr.file);
    if (!fs.existsSync(file)) { rows.push({ key: s.key, state: scr.state, status: 'missing' }); continue; }
    const overlay = path.join(path.dirname(file), `diff-full-${scr.state}.png`);
    const r = diff(base, file, { out: overlay, threshold: 0 });
    rows.push({
      key: s.key, page: s.page, viewport: s.viewport, state: scr.state, label: scr.label ?? null,
      baseFull: m.files.full, file: scr.file, diffPixels: r.diffPixels, ratio: Number((r.ratio ?? 1).toFixed(6)),
      changed: (r.ratio ?? 1) > 0.0002, sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      overlay: path.relative(ROOT, overlay).replace(/\\/g, '/'),
    });
  }
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
const unchanged = rows.filter((r) => r.changed === false);
console.log(JSON.stringify({ total: rows.length, changed: rows.length - unchanged.length, unchanged: unchanged.length }));
console.log('still unchanged (full page):');
for (const r of unchanged) console.log(`  ${r.key}/${r.state} ratio=${r.ratio}${r.sizeMismatch ? ' SIZE-MISMATCH' : ''}`);