// P02 baseline defects probe - identifies the element that overflows the viewport
// and confirms empty-src placeholder images. Read-only.
import { chromium } from 'playwright';
import fs from 'node:fs';

const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines/defects-probe.json';
const TARGETS = [
  ['user/riwayat_ulasan_desktop.html', 320, 700],
  ['penerbit/invoice_penjualan_pdf_portal_penerbit.html', 320, 700],
];
const EMPTY_SRC = [
  'user/detail_buku_desktop.html', 'user/detail_agenda_desktop.html',
  'user/komunitas_literasi_desktop.html', 'penerbit/kelola_buku_desktop.html',
];

const browser = await chromium.launch();
const res = {};

for (const [page_, w, h] of TARGETS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/${page_}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(300);
  res[`${page_}@${w}x${h}`] = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        const s = getComputedStyle(el);
        // skip elements whose ancestor already scrolls horizontally
        let anc = el.parentElement, scrolls = false;
        while (anc && anc !== document.body) {
          const as = getComputedStyle(anc);
          if (as.overflowX === 'auto' || as.overflowX === 'scroll' || as.overflowX === 'clip' || as.overflowX === 'hidden') { scrolls = true; break; }
          anc = anc.parentElement;
        }
        offenders.push({ tag: el.tagName.toLowerCase(), id: el.id || null, cls: el.className.toString().slice(0, 70), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), scrollAncestor: scrolls });
      }
    }
    return { viewport: vw, docScrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, offenders: offenders.slice(0, 12), scrollRegions: [...document.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowX)).map((e) => ({ tag: e.tagName.toLowerCase(), id: e.id || null, cls: e.className.toString().slice(0, 60), scrollW: e.scrollWidth, clientW: e.clientWidth })).slice(0, 8) };
  });
  await ctx.close();
}

for (const p of EMPTY_SRC) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(300);
  res[`${p}#empty-src`] = await page.evaluate(() => [...document.images].filter((i) => !i.getAttribute('src')).map((i) => ({ id: i.id || null, cls: i.className.toString().slice(0, 50), filled: Boolean(i.currentSrc) })));
  res[`${p}#self-requests`] = reqs.filter((u) => u.endsWith(p.split('/').pop())).length;
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res).slice(0, 1200));
await browser.close();