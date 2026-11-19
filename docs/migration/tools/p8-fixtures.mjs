// P08 fixtures: the page datasets live inside IIFEs, so the literals are bracket-matched out of the source scripts
// and evaluated with the few helpers they reference. Same numbers the pages render, one JSON fixture.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p8-source';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/data/ikapi/publisher.json';
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
  'function hariLalu(n){ return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }';

const jobs = [
  ['dashboard_penerbit_desktop', ['DEMO', 'EMPTY', 'FILLED']],
  ['pesanan_masuk_desktop', ['BASE_ORDERS']],
  ['pendapatan_dan_pencairan_desktop', ['BASE']],
  ['ulasan_pembeli_desktop', ['BASE_REVIEWS']],
  ['pengaturan_profil_desktop', ['SAVED_PROFILE', 'SAVED_BANK']],
];

const out = {};
for (const [page, names] of jobs) {
  const src = readScript(page);
  const earlier = []; // literals already evaluated on this page, so later ones can reference them (FILLED -> DEMO)
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
      console.log('ok  ', page, name, Array.isArray(value) ? 'list ' + value.length : 'dict ' + Object.keys(value).length);
    } catch (e) {
      console.log('ERR ', page, name, String(e).slice(0, 120));
    }
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + NL, 'utf8');
console.log(NL + 'written', OUT, '| keys:', Object.keys(out).join(', '));