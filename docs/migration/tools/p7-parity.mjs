// P07 parity: Blade page vs the prototype SPA driven into the same state, then pixel diff.
// Usage: P7_BASE=http://127.0.0.1:8140 node docs/migration/tools/p7-parity.mjs [name]
//        P7_VIEWPORTS=1440x900,390x844 (default)
// Writes docs/migration/baselines/p7/<name>/<viewport>-{blade,proto,diff}.png and docs/migration/p7-parity.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const BASE = process.env.P7_BASE || 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/p7');
const only = process.argv[2];
const VIEWPORTS = (process.env.P7_VIEWPORTS || '1440x900,390x844').split(',').map((v) => {
  const [w, h] = v.split('x').map(Number);
  return { label: v, width: w, height: h };
});

// The prototype is one page with in-place views: `proto` may be a query string and `prep` clicks into the view.
const PAIRS = [
  { name: 'directory', blade: '/komunitas', proto: '', prep: null },
  { name: 'profile', blade: '/komunitas/community-filologi', proto: '?komunitas=community-filologi', prep: null },
  {
    name: 'room',
    blade: '/komunitas/community-filologi/diskusi',
    proto: '?komunitas=community-filologi',
    prep: async (page) => { await page.click('#btn-open-room-inline'); await page.waitForTimeout(300); },
  },
  { name: 'topic', blade: '/komunitas/community-klub-buku/diskusi/TPC-2026-101', proto: '?komunitas=community-klub-buku&topik=TPC-2026-101', prep: null },
  { name: 'reply', blade: '/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-2026-201', proto: '?balas=RPL-2026-201', prep: null },
].filter((p) => !only || p.name === only);

const browser = await chromium.launch();
const results = [];

async function shot(url, vp, file, prep) {
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

  await page.addStyleTag({ content: '*{caret-color:transparent !important}' });
  if (prep) await prep(page);
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
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
  await page.waitForTimeout(450);
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
    text: (document.querySelector('main') ? document.querySelector('main').innerText : '').replace(/\s+/g, ' ').trim(),
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    visibleViews: [...document.querySelectorAll('[id^="view-"]')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id),
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
    const b = await shot(BASE + pair.blade, vp, fileB, null);
    const p = await shot(PROTO + pair.proto, vp, fileP, pair.prep);
    const r = diff(fileP, fileB, { out: fileD, threshold: 0 });
    // A 1px full-page height delta (fractional line-height rounding) makes pixel diffing meaningless; the viewport
    // capture is the same width/height on both sides and is recorded next to it for those cases.
    const rv = diff(fileP.replace('.png', '-viewport.png'), fileB.replace('.png', '-viewport.png'), { threshold: 0 });
    const row = {
      page: pair.name, viewport: vp.label,
      ratio: Number((r.ratio ?? 1).toFixed(6)), diffPixels: r.diffPixels, sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      viewportRatio: Number((rv.ratio ?? 1).toFixed(6)), viewportDiffPixels: rv.diffPixels,
      heightDelta: p.metrics.scrollH - b.metrics.scrollH,
      protoHeight: p.metrics.scrollH, bladeHeight: b.metrics.scrollH,
      protoWidth: p.metrics.scrollW, bladeWidth: b.metrics.scrollW,
      textEqual: b.metrics.text === p.metrics.text,
      bladeTextLength: b.metrics.text.length, protoTextLength: p.metrics.text.length,
      views: { blade: b.metrics.visibleViews, proto: p.metrics.visibleViews },
      brokenImages: { blade: b.metrics.brokenImages, proto: p.metrics.brokenImages },
      errors: { blade: b.errors, proto: p.errors },
      badResponses: { blade: b.bad, proto: p.bad },
    };
    results.push(row);
    console.log(`${pair.name}@${vp.label} ratio=${row.ratio} viewport=${row.viewportRatio} dh=${row.heightDelta} h=${row.bladeHeight}/${row.protoHeight} w=${row.bladeWidth}/${row.protoWidth} text=${row.textEqual} broken=${row.brokenImages.blade}/${row.brokenImages.proto} err=${b.errors.length}/${p.errors.length} bad=${b.bad.length}/${p.bad.length}`);
    const acc = fs.existsSync(path.join(ROOT, 'docs/migration/p7-parity.json'))
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/migration/p7-parity.json'), 'utf8'))
      : [];
    const merged = acc.filter((x) => !(x.page === row.page && x.viewport === row.viewport)).concat(row);
    fs.writeFileSync(path.join(ROOT, 'docs/migration/p7-parity.json'), JSON.stringify(merged, null, 1));
  }
}

await browser.close();