// P08 parity: Portal Penerbit Blade pages vs the prototype pages, same viewport, pixel diff.
// Usage: P8_BASE=http://127.0.0.1:8140 node docs/migration/tools/p8-parity.mjs [name]
//        P8_VIEWPORTS=1440x900,1366x768,390x844,320x700
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const BASE = process.env.P8_BASE || 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy/penerbit';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/p8');
const only = process.argv[2];
const VIEWPORTS = (process.env.P8_VIEWPORTS || '1440x900,390x844').split(',').map((v) => {
  const [w, h] = v.split('x').map(Number);
  return { label: v, width: w, height: h };
});

const PAIRS = [
  { name: 'dashboard', blade: '/penerbit', proto: 'dashboard_penerbit_desktop.html' },
  { name: 'books', blade: '/penerbit/buku', proto: 'kelola_buku_desktop.html' },
  { name: 'orders', blade: '/penerbit/pesanan', proto: 'pesanan_masuk_desktop.html' },
  { name: 'finance', blade: '/penerbit/keuangan', proto: 'pendapatan_dan_pencairan_desktop.html' },
  { name: 'reviews', blade: '/penerbit/ulasan', proto: 'ulasan_pembeli_desktop.html' },
  { name: 'settings', blade: '/penerbit/pengaturan', proto: 'pengaturan_profil_desktop.html' },
  { name: 'invoice', blade: '/penerbit/invoice', proto: 'invoice_penjualan_pdf_portal_penerbit.html' },
].filter((p) => !only || p.name === only);

const browser = await chromium.launch();
const results = [];

async function shot(url, vp, file) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 170)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-52)}`); });
  // `load` can stall on the Google Fonts CDN (baseline D6); fall back to domcontentloaded so the run is not lost.
  await page.goto(url, { waitUntil: 'load', timeout: 20000 }).catch(async () => { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); });
  // Deterministic fonts: the CDN can stall, and a font that arrives late changes text metrics (and page height).
  // Ask for each family explicitly and only capture once every face the pages use is loaded.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(async () => {
      const fams = ['400 16px "DM Sans"', '600 16px "DM Sans"', '700 16px "DM Sans"', '400 16px Literata', '600 16px Literata', '700 16px Literata', '400 16px "Material Symbols Outlined"', '400 16px "Plus Jakarta Sans"'];
      await Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null)));
      await document.fonts.ready;
    }).catch(() => {});
    const ok = await page.evaluate(() => ['DM Sans', 'Literata', 'Material Symbols Outlined'].every((f) => document.fonts.check('16px "' + f + '"')));
    if (ok) break;
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  }

  await page.addStyleTag({ content: '*{caret-color:transparent !important}' });
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const imgs = [...document.images].filter((i) => !i.complete);
      if (!imgs.length) break;
      await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 5000))]);
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  await page.waitForTimeout(400);
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
    text: (document.querySelector('main') ? document.querySelector('main').innerText : '').replace(/\s+/g, ' ').trim(),
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 22),
  }));
  await page.screenshot({ path: file.replace('.png', '-viewport.png'), fullPage: false });
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return { metrics, errors, bad };
}

for (const pair of PAIRS) {
  for (const vp of VIEWPORTS) {
    const dir = path.join(OUT, pair.name);
    fs.mkdirSync(dir, { recursive: true });
    const fileB = path.join(dir, `${vp.label}-blade.png`);
    const fileP = path.join(dir, `${vp.label}-proto.png`);
    const fileD = path.join(dir, `${vp.label}-diff.png`);
    const b = await shot(BASE + pair.blade, vp, fileB);
    const p = await shot(`${PROTO}/${pair.proto}`, vp, fileP);
    const r = diff(fileP, fileB, { out: fileD, threshold: 0 });
    const rv = diff(fileP.replace('.png', '-viewport.png'), fileB.replace('.png', '-viewport.png'), { threshold: 0 });
    const row = {
      page: pair.name, viewport: vp.label,
      ratio: Number((r.ratio ?? 1).toFixed(6)), diffPixels: r.diffPixels,
      viewportRatio: Number((rv.ratio ?? 1).toFixed(6)),
      sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      heightDelta: p.metrics.scrollH - b.metrics.scrollH,
      protoHeight: p.metrics.scrollH, bladeHeight: b.metrics.scrollH,
      protoWidth: p.metrics.scrollW, bladeWidth: b.metrics.scrollW,
      textEqual: b.metrics.text === p.metrics.text,
      bladeTextLength: b.metrics.text.length, protoTextLength: p.metrics.text.length,
      brokenImages: { blade: b.metrics.brokenImages, proto: p.metrics.brokenImages },
      bodyFont: { blade: b.metrics.bodyFont, proto: p.metrics.bodyFont },
      errors: { blade: b.errors, proto: p.errors },
      badResponses: { blade: b.bad, proto: p.bad },
    };
    results.push(row);
    console.log(`${pair.name}@${vp.label} ratio=${row.ratio} viewport=${row.viewportRatio} dh=${row.heightDelta} h=${row.bladeHeight}/${row.protoHeight} w=${row.bladeWidth}/${row.protoWidth} text=${row.textEqual} broken=${row.brokenImages.blade}/${row.brokenImages.proto} err=${b.errors.length}/${p.errors.length} bad=${b.bad.length}/${p.bad.length}`);
    const acc = fs.existsSync(path.join(ROOT, 'docs/migration/p8-parity.json'))
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/migration/p8-parity.json'), 'utf8'))
      : [];
    const merged = acc.filter((x) => !(x.page === row.page && x.viewport === row.viewport)).concat(row);
    fs.writeFileSync(path.join(ROOT, 'docs/migration/p8-parity.json'), JSON.stringify(merged, null, 1));
  }
}

await browser.close();