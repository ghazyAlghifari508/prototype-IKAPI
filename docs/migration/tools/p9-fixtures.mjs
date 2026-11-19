// P09 fixtures: admin datasets live inside IIFEs, so literals are bracket-matched from the source scripts and
// evaluated with the helpers they reference. One JSON fixture = the same rows the admin pages render.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p9-source';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/data/ikapi/admin.json';
const NL = String.fromCharCode(10);

function readScript(page) {
  const dir = path.join(SRC, page);
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('script-'))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join(NL);
}

function literalOf(src, name) {
  const m = new RegExp('var\\s+' + name + '\\s*=\\s*([\\[{])').exec(src);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

const HELPER =
  'function rupiah(v){ return "Rp " + Number(v).toLocaleString("id-ID"); }' +
  NL +
  'function hariLalu(n){ return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }' +
  NL +
  'function hoursAgo(h){ return new Date(Date.now() - h * 3600000).toISOString(); }';

const jobs = [
  ['dashboard_administrasi_utama_desktop', ['BASE']],
  ['kelola_pengguna_desktop', ['BASE_USERS']],
  ['pengawasan_katalog_buku_global_desktop', ['BASE_REPORTS', 'BASE_CATALOG']],
  ['moderasi_ulasan_dan_komentar_desktop', ['BASE_RECORDS']],
  ['monitoring_global_desktop', ['BASE_TX']],
  ['kelola_pencairan_dana_desktop', ['BASE_PAYOUTS']],
  ['kelola_komunitas_desktop', ['DEFAULTS']],
  ['moderasi_diskusi_komunitas_desktop', ['seeds']],
];

const out = {};
for (const [page, names] of jobs) {
  const src = readScript(page);
  const earlier = [];
  for (const name of names) {
    const lit = literalOf(src, name);
    if (!lit) {
      console.log('MISS', page, name);
      continue;
    }
    try {
      const prelude = earlier.map(([n, l]) => 'var ' + n + ' = (' + l + ');').join(NL);
      const value = new Function(HELPER + NL + prelude + NL + 'return (' + lit + ');')();
      out[name] = value;
      earlier.push([name, lit]);
      console.log('ok  ', page.padEnd(38), name.padEnd(14), Array.isArray(value) ? 'list ' + value.length : 'dict ' + Object.keys(value).length);
    } catch (e) {
      console.log('ERR ', page, name, String(e).slice(0, 110));
    }
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + NL, 'utf8');
console.log(NL + 'written', OUT, '| keys:', Object.keys(out).join(', '));