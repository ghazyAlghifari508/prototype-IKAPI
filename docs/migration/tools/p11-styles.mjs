// P11 computed-style parity + two content invariants from the brief:
//   - computed font/colour/spacing/radius/shadow of representative elements must match the prototype
//   - reader offers no download control
//   - community directory keeps the five-people hero
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p11-styles.json';
const PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'borderTopLeftRadius', 'boxShadow', 'paddingTop', 'paddingLeft', 'marginBottom', 'textTransform'];

const CASES = [
  ['home@1440', '/', 'user/beranda_desktop.html', { width: 1440, height: 900 }, ['header', 'header a[aria-label]', 'h1', 'section h2', 'footer', 'footer a']],
  ['katalog@1440', '/katalog', 'user/katalog_buku_desktop.html', { width: 1440, height: 900 }, ['header', 'h1', '#catalog-products-container article', '#catalog-products-container article h3', '#catalog-sort-select']],
  ['detail@1440', '/buku/laskar-aksara-pasundan', 'user/detail_buku_desktop.html', { width: 1440, height: 900 }, ['header', 'h1', 'article', '#btnAddToCart', '#btnSamplePreview']],
  ['login@390', '/masuk', 'user/masuk_login_desktop.html', { width: 390, height: 844 }, ['form', 'h1', 'input[type="email"]', 'button[type="submit"]']],
  ['penerbit@1440', '/penerbit', 'penerbit/dashboard_penerbit_desktop.html', { width: 1440, height: 900 }, ['h1', 'main article', 'table', 'th', '#btn-notif']],
  ['admin@1440', '/admin', 'admin/dashboard_administrasi_utama_desktop.html', { width: 1440, height: 900 }, ['h1', 'main article', 'table', 'th', 'header']],
  ['invoice@1440', '/penerbit/invoice', 'penerbit/invoice_penjualan_pdf_portal_penerbit.html', { width: 1440, height: 900 }, ['table', 'th', 'td', 'h1']],
  ['komunitas@1440', '/komunitas', 'user/komunitas_literasi_desktop.html', { width: 1440, height: 900 }, ['h1', '#directory-grid article', '#directory-grid article h3']],
];

const readStyles = (page, sels) => page.evaluate(({ sels, PROPS }) => {
  const out = {};
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) { out[sel] = null; continue; }
    const cs = getComputedStyle(el);
    const pick = {};
    for (const p of PROPS) pick[p] = cs[p];
    out[sel] = pick;
  }
  return out;
}, { sels, PROPS });

const browser = await chromium.launch();
const rows = [];
for (const [label, route, proto, vp, sels] of CASES) {
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
    await page.waitForTimeout(300);
    res[tag] = await readStyles(page, sels);
    await ctx.close();
  }
  const diffs = [];
  for (const sel of sels) {
    const a = res.blade[sel];
    const b = res.proto[sel];
    if (!a || !b) { diffs.push({ sel, missing: !a ? 'blade' : 'proto' }); continue; }
    for (const p of PROPS) if (a[p] !== b[p]) diffs.push({ sel, prop: p, blade: a[p], proto: b[p] });
  }
  rows.push({ label, checked: sels.length, diffs });
  console.log(label.padEnd(16), 'selectors', sels.length, 'diffs', diffs.length, diffs.slice(0, 3).map((d) => `${d.sel}/${d.prop}: ${d.blade} vs ${d.proto}`).join(' ; '));
}

/* content invariants */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/akun/perpustakaan/laskar-aksara-pasundan/baca', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const reader = await page.evaluate(() => {
    const txt = document.body.innerText.toLowerCase();
    const dl = [...document.querySelectorAll('a, button')].filter((el) => /unduh|download|simpan pdf/i.test(el.textContent || '') || /\.pdf$/i.test(el.getAttribute('href') || ''));
    return { downloadControls: dl.length, mentionsDownload: /unduh|download/.test(txt), anchorsToFile: [...document.querySelectorAll('a[href$=".pdf"], a[download]')].length };
  });
  await page.goto(BASE + '/komunitas', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const hero = await page.evaluate(() => {
    const heroEl = document.querySelector('section');
    const avatars = document.querySelectorAll('section img[alt*="anggota" i], section img[alt*="komunitas" i], section [class*="rounded-full"] img');
    return { heroAvatars: avatars.length, heroHasFive: /5|lima/i.test(heroEl?.innerText || '') };
  });
  rows.push({ label: 'invariants', reader, hero });
  console.log('invariants', JSON.stringify({ reader, hero }));
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('written', OUT);