// P11 geometry proof for pages that still show a non-zero pixel diff: compare bounding boxes of every visible
// element (x, y, w, h to 0.01px). Identical boxes + identical text means the diff is rasterisation, not layout.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p11-geometry.json';
const CASES = [
  ['katalog@320', '/katalog', 'user/katalog_buku_desktop.html', { width: 320, height: 700 }],
  ['onboarding@390', '/onboarding', 'user/onboarding_preferensi_bacaan_desktop.html', { width: 390, height: 844 }],
  ['cart@1366', '/keranjang', 'user/keranjang_pembayaran_terpadu_desktop.html', { width: 1366, height: 768 }],
  ['library@320', '/akun/perpustakaan', 'user/perpustakaan_saya_desktop.html', { width: 320, height: 700 }],
  ['agenda@320', '/agenda', 'user/agenda_berita_literasi_desktop.html', { width: 320, height: 700 }],
  ['agenda-detail@1366', '/agenda/ev-1', 'user/detail_agenda_desktop.html?id=ev-1', { width: 1366, height: 768 }],
  ['login@390', '/masuk', 'user/masuk_login_desktop.html', { width: 390, height: 844 }],
  ['forgot@320', '/lupa-kata-sandi', 'user/lupa_kata_sandi_desktop.html', { width: 320, height: 700 }],
  ['penerbit-dashboard@768', '/penerbit', 'penerbit/dashboard_penerbit_desktop.html', { width: 768, height: 1024 }],
  ['penerbit-books@768', '/penerbit/buku', 'penerbit/kelola_buku_desktop.html', { width: 768, height: 1024 }],
  ['penerbit-finance@1366', '/penerbit/keuangan', 'penerbit/pendapatan_dan_pencairan_desktop.html', { width: 1366, height: 768 }],
  ['penerbit-invoice@320', '/penerbit/invoice', 'penerbit/invoice_penjualan_pdf_portal_penerbit.html', { width: 320, height: 700 }],
  ['admin-dashboard@1366', '/admin', 'admin/dashboard_administrasi_utama_desktop.html', { width: 1366, height: 768 }],
  ['admin-users@1366', '/admin/pengguna', 'admin/kelola_pengguna_desktop.html', { width: 1366, height: 768 }],
  ['admin-payouts@390', '/admin/pencairan', 'admin/kelola_pencairan_dana_desktop.html', { width: 390, height: 844 }],
  ['admin-communities@1440', '/admin/komunitas', 'admin/kelola_komunitas_desktop.html', { width: 1440, height: 900 }],
  ['admin-login@1440', '/admin/masuk', 'admin/login_administrator_desktop.html', { width: 1440, height: 900 }],
];

const collect = async (page) => page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!(el instanceof HTMLElement)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    out.push({
      sig: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '|' + String(el.className).slice(0, 30),
      box: [Math.round(r.x * 100) / 100, Math.round((r.y + window.scrollY) * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100],
    });
  }
  // Key elements by signature + occurrence index so a single extra/missing node cannot cascade.
  const seen = new Map();
  for (const e of out) {
    const n = seen.get(e.sig) || 0;
    seen.set(e.sig, n + 1);
    e.key = `${e.sig}#${n}`;
  }
  return {
    els: out,
    scrollH: document.documentElement.scrollHeight,
    scrollW: document.documentElement.scrollWidth,
    text: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 4000),
  };
});

const browser = await chromium.launch();
const rows = [];
for (const [label, route, proto, vp] of CASES) {
  const res = {};
  for (const [tag, url] of [['blade', BASE + route], ['proto', `${PROTO}/${proto}`]]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.evaluate(async () => {
      const fams = ['400 16px "DM Sans"', '600 16px "DM Sans"', '700 16px "DM Sans"', '400 16px Literata', '600 16px Literata', '700 16px Literata', '400 16px "Material Symbols Outlined"'];
      await Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null)));
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]);
    });
    await page.waitForTimeout(500);
    res[tag] = await collect(page);
    await ctx.close();
  }
  const mapB = new Map(res.blade.els.map((e) => [e.key, e]));
  const mapP = new Map(res.proto.els.map((e) => [e.key, e]));
  const boxDiffs = [];
  for (const [key, a] of mapB) {
    const b = mapP.get(key);
    if (!b) { boxDiffs.push({ key, missing: 'proto' }); continue; }
    const d = a.box.map((v, k) => Math.round((v - b.box[k]) * 100) / 100);
    if (d.some((v) => Math.abs(v) > 0.01)) boxDiffs.push({ key, blade: a.box, proto: b.box, delta: d });
  }
  for (const key of mapP.keys()) if (!mapB.has(key)) boxDiffs.push({ key, missing: 'blade' });
  // Multiset comparison: a single inserted word (e.g. the cart badge digit) must not cascade into "60 differences".
  const bag = (t) => {
    const m = new Map();
    for (const w of t.split(' ').filter(Boolean)) m.set(w, (m.get(w) || 0) + 1);
    return m;
  };
  const ba = bag(res.blade.text);
  const bp = bag(res.proto.text);
  let textDiff = 0;
  for (const [w, n] of ba) textDiff += Math.abs(n - (bp.get(w) || 0));
  for (const [w, n] of bp) if (!ba.has(w)) textDiff += n;
  const sharedDeltaCount = boxDiffs.filter((b) => b.delta).length;
  const missingNodeCount = boxDiffs.length - sharedDeltaCount;
  rows.push({ label, viewport: vp, elements: [res.blade.els.length, res.proto.els.length], height: [res.blade.scrollH, res.proto.scrollH], width: [res.blade.scrollW, res.proto.scrollW], boxDiffCount: boxDiffs.length, sharedDeltaCount, missingNodeCount, boxDiffs: boxDiffs.slice(0, 5), textWordDiffs: textDiff });
  console.log(label.padEnd(24), 'els', `${res.blade.els.length}/${res.proto.els.length}`, 'h', `${res.blade.scrollH}/${res.proto.scrollH}`, 'boxDiffs', boxDiffs.length, 'textDiffs', textDiff);
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('written', OUT);