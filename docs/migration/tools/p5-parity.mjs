// P05 parity: screenshot the Blade page and the prototype page at the same viewport and diff them.
// Usage: P5_BASE=http://127.0.0.1:8140 node docs/migration/tools/p5-parity.mjs [onlyName]
//        P5_VIEWPORTS=1440x900,390x844 (default)
// Each pair: { name, blade, proto }. Writes docs/migration/baselines/p5/<name>/<viewport>-{blade,proto,diff}.png
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const BASE = process.env.P5_BASE || 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy/user';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/p5');
const only = process.argv[2];
const VIEWPORTS = (process.env.P5_VIEWPORTS || '1440x900,390x844').split(',').map((v) => {
  const [w, h] = v.split('x').map(Number);
  return { label: v, width: w, height: h };
});

const PAIRS = [
  { name: 'home', blade: '/', proto: 'beranda_desktop.html' },
  { name: 'catalog', blade: '/katalog', proto: 'katalog_buku_desktop.html' },
  { name: 'detail', blade: '/buku/laskar-aksara-pasundan', proto: 'detail_buku_desktop.html' },
  { name: 'preview', blade: '/buku/laskar-aksara-pasundan/cuplikan', proto: 'preview_buku_desktop.html' },
].filter((p) => !only || p.name === only);

const browser = await chromium.launch();
const results = [];

async function shot(url, vp, file) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-60)}`); });
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

  // Scroll the whole document so `loading="lazy"` images start fetching, then wait for every image to settle.
  // Without this the Blade page can be captured with unloaded covers (measured 28% apparent diff).
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const imgs = [...document.images].filter((i) => !i.complete);
      if (!imgs.length) break;
      await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 6000))]);
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await page.waitForTimeout(500);
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    scrollH: document.documentElement.scrollHeight,
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 24),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    h1: [...document.querySelectorAll('h1')].map((h) => ({ t: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), fs: getComputedStyle(h).fontSize, lh: getComputedStyle(h).lineHeight, box: (() => { const r = h.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width)]; })() })),
    cards: document.querySelectorAll('article').length,
    images: document.images.length,
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
  }));
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
    const row = {
      page: pair.name, viewport: vp.label,
      ratio: Number((r.ratio ?? 1).toFixed(6)), diffPixels: r.diffPixels, sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      protoHeight: p.metrics.scrollH, bladeHeight: b.metrics.scrollH,
      protoWidth: p.metrics.scrollW, bladeWidth: b.metrics.scrollW,
      errors: { blade: b.errors, proto: p.errors },
      badResponses: { blade: b.bad, proto: p.bad },
      h1: { blade: b.metrics.h1, proto: p.metrics.h1 },
      cards: { blade: b.metrics.cards, proto: p.metrics.cards },
      brokenImages: { blade: b.metrics.brokenImages, proto: p.metrics.brokenImages },
      body: { blade: [b.metrics.bodyFont, b.metrics.bodyBg], proto: [p.metrics.bodyFont, p.metrics.bodyBg] },
    };
    results.push(row);
    console.log(`${pair.name}@${vp.label} ratio=${row.ratio} sizeMismatch=${row.sizeMismatch ?? false} h=${b.metrics.scrollH}/${p.metrics.scrollH} w=${b.metrics.scrollW}/${p.metrics.scrollW} cards=${b.metrics.cards}/${p.metrics.cards} broken=${b.metrics.brokenImages}/${p.metrics.brokenImages} err=${b.errors.length}/${p.errors.length} bad=${b.bad.length}/${p.bad.length}`);
    fs.writeFileSync(path.join(ROOT, 'docs/migration/p5-parity.json'), JSON.stringify(results, null, 1));
  }
}

await browser.close();