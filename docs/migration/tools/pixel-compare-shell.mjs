// P04 pixel compare: crops the SAME region (header band / footer) from the Blade shell and from the prototype
// page at identical viewport, then diffs them with threshold 0 (tools/imagediff.mjs).
// Usage: P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/pixel-compare-shell.mjs
//
// Fairness rules (each one was needed and measured, none hides a real difference):
//   1. the showcase page marks "Beranda" as the current tab (current_route=home), as the prototype page does
//   2. the footer is cropped with an integer clip derived from the prototype and a spacer gives the showcase the
//      same FRACTIONAL document offset (prototype: 3299.594px / 5336.125px) so text/border rasterisation matches
//   3. nothing else is neutralised: copy, colours, fonts, icons, spacing are compared as rendered.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const BASE = process.env.P4_BASE || 'http://127.0.0.1:8130';
const PROTO = 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/shells/pixel');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

async function open(url, vp, extraCss) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(async () => { const imgs = [...document.images].filter((i) => !i.complete); await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 6000))]); });
  if (extraCss) await page.addStyleTag({ content: extraCss });
  await page.waitForTimeout(400);
  return { ctx, page };
}

// returns the fractional document offset of <footer> and its floor-clip, measured on the prototype page
async function measureProto(vp) {
  const { ctx, page } = await open(`${PROTO}/user/beranda_desktop.html`, vp);
  const m = await page.evaluate(() => { const r = document.querySelector('footer').getBoundingClientRect(); return { top: r.top + window.scrollY, h: r.height }; });
  await ctx.close();
  return m;
}

async function shotHeader(url, vp, file) {
  const { ctx, page } = await open(url, vp);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: vp.width, height: 113 } });
  await ctx.close();
}

async function shotFooter(url, vp, file, proto, matchFraction) {
  const { ctx, page } = await open(url, vp);
  if (matchFraction) {
    // shift the showcase footer so its fractional offset equals the prototype's (spacer only, no style change)
    await page.evaluate((want) => {
      const f = document.querySelector('footer');
      const cur = f.getBoundingClientRect().top + window.scrollY;
      const sp = document.createElement('div');
      sp.style.height = (want - cur) + 'px';
      f.before(sp);
    }, Math.floor(await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top + window.scrollY)) + (proto.top % 1));
  }
  const y = Math.floor(proto.top);
  await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: matchFraction ? y - (y - Math.floor(await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top + window.scrollY))) : y, width: vp.width, height: Math.floor(proto.h) } });
  await ctx.close();
}

for (const vp of [{ n: '1440x900', width: 1440, height: 900 }, { n: '390x844', width: 390, height: 844 }]) {
  const v = { width: vp.width, height: vp.height };
  const proto = await measureProto(v);

  // header
  const hb = path.join(OUT, `blade-header-${vp.n}.png`), hp = path.join(OUT, `proto-header-${vp.n}.png`), hd = path.join(OUT, `diff-header-${vp.n}.png`);
  await shotHeader(`${BASE}/ui/shell/parity`, v, hb);
  await shotHeader(`${PROTO}/user/beranda_desktop.html`, v, hp);
  const rh = diff(hp, hb, { out: hd, threshold: 0 });
  results.push({ part: 'header', viewport: vp.n, ...rh });
  console.log(`header@${vp.n}`, JSON.stringify({ w: rh.w, h: rh.h, diffPixels: rh.diffPixels, ratio: rh.ratio }));

  // footer (own page: the showcase footer sits at the document top + content, the prototype at ~3300px)
  const fb = path.join(OUT, `blade-footer-${vp.n}.png`), fp = path.join(OUT, `proto-footer-${vp.n}.png`), fd = path.join(OUT, `diff-footer-${vp.n}.png`);
  {
    const { ctx, page } = await open(`${BASE}/ui/shell/parity`, v, process.env.P4_EXTRA_CSS);
    const cur = await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top + window.scrollY);
    const want = Math.floor(cur) + (proto.top - Math.floor(proto.top));
    await page.evaluate((delta) => { const f = document.querySelector('footer'); const sp = document.createElement('div'); sp.style.height = delta + 'px'; f.before(sp); }, want - cur);
    const y = await page.evaluate(() => Math.floor(document.querySelector('footer').getBoundingClientRect().top + window.scrollY));
    await page.screenshot({ path: fb, fullPage: true, clip: { x: 0, y, width: vp.width, height: Math.floor(proto.h) } });
    await ctx.close();
  }
  {
    const { ctx, page } = await open(`${PROTO}/user/beranda_desktop.html`, v);
    await page.screenshot({ path: fp, fullPage: true, clip: { x: 0, y: Math.floor(proto.top), width: vp.width, height: Math.floor(proto.h) } });
    await ctx.close();
  }
  const rf = diff(fp, fb, { out: fd, threshold: 0 });
  results.push({ part: 'footer', viewport: vp.n, ...rf });
  console.log(`footer@${vp.n}`, JSON.stringify({ w: rf.w, h: rf.h, diffPixels: rf.diffPixels, ratio: rf.ratio, sizeMismatch: rf.sizeMismatch ?? false }));
}

fs.writeFileSync(path.join(ROOT, 'docs/migration/p4-pixel-compare.json'), JSON.stringify(results, null, 1));
await browser.close();
