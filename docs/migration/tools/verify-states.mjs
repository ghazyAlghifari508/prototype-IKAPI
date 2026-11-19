// P02 state verification: does every captured interaction state actually differ from the page default?
// Usage: node docs/migration/tools/verify-states.mjs
// Writes docs/migration/baselines/states-verification.json  and  <page>/diff-<state>.png overlays.
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const STATES = path.join(ROOT, 'states-manifest.json');
const MATRIX = path.join(ROOT, 'manifest.json');
const OUT = path.join(ROOT, 'states-verification.json');

const matrix = JSON.parse(fs.readFileSync(MATRIX, 'utf8'));
const defaultOf = (page, viewport) => {
  const vp = viewport === 'mobile' ? '390x844' : '1440x900';
  const e = matrix.find((m) => m.page === page && m.viewport === vp && m.files);
  return e ? path.join(ROOT, e.files.viewport) : null;
};

const rows = [];
for (const s of JSON.parse(fs.readFileSync(STATES, 'utf8'))) {
  const base = defaultOf(s.page, s.viewport);
  for (const scr of s.screens ?? []) {
    const file = path.join(ROOT, scr.file);
    if (!base || !fs.existsSync(file)) { rows.push({ key: s.key, state: scr.state, status: 'missing' }); continue; }
    const overlay = path.join(path.dirname(file), `diff-${scr.state}.png`);
    const r = diff(base, file, { out: overlay, threshold: 0 });
    rows.push({
      key: s.key, page: s.page, viewport: s.viewport, state: scr.state, label: scr.label ?? null,
      file: scr.file, bytes: scr.bytes, diffPixels: r.diffPixels, ratio: Number((r.ratio ?? 1).toFixed(6)),
      changed: (r.ratio ?? 1) > 0.0002, sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      overlay: path.relative(ROOT, overlay).replace(/\\/g, '/'),
    });
  }
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
const changed = rows.filter((r) => r.changed).length;
const same = rows.filter((r) => r.changed === false).length;
console.log(JSON.stringify({ total: rows.length, changed, unchanged: same, missing: rows.filter((r) => r.status === 'missing').length }));
console.log('unchanged states:', rows.filter((r) => r.changed === false).map((r) => `${r.key}/${r.state}`).join(', '));