// P10 state inventory: every localStorage key the migrated app touches, with writes/reads/removes per module.
// Source of truth is the shipped JS (keys are sometimes built from template strings).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/js';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p10-inventory.json';
const SLASH = String.fromCharCode(92);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}

const files = walk(ROOT);
const rows = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).split(SLASH).join('/');
  const keys = new Set([...src.matchAll(/ikapi_[a-z0-9_]+/g)].map((m) => m[0]));
  for (const key of keys) {
    const count = (pattern) => (src.match(new RegExp(pattern, 'g')) || []).length;
    rows.push({
      file: rel,
      key,
      writes: count(key + '[^\\n]*setItem'),
      reads: count(key + '[^\\n]*getItem'),
      removes: count(key + '[^\\n]*removeItem'),
      literals: count("'" + key + "'"),
    });
  }
}
const byKey = {};
for (const r of rows) {
  byKey[r.key] = byKey[r.key] || { files: new Set(), writes: 0, reads: 0, removes: 0 };
  byKey[r.key].files.add(r.file);
  byKey[r.key].writes += r.writes;
  byKey[r.key].reads += r.reads;
  byKey[r.key].removes += r.removes;
}
const summary = Object.entries(byKey)
  .map(([key, v]) => ({ key, writes: v.writes, reads: v.reads, removes: v.removes, files: [...v.files].sort() }))
  .sort((a, b) => a.key.localeCompare(b.key));
fs.writeFileSync(OUT, JSON.stringify({ generatedFrom: files.length + ' modules', keys: summary }, null, 2) + '\n', 'utf8');
console.log('modules scanned:', files.length, '| keys:', summary.length);
for (const s of summary) {
  console.log(s.key.padEnd(36) + ' w=' + s.writes + ' r=' + s.reads + ' x=' + s.removes + '  ' + s.files.join(', ').slice(0, 100));
}