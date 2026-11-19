import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => {
  const h = getComputedStyle(document.documentElement), bd = getComputedStyle(document.body);
  return { htmlDisplay: h.display, htmlPlace: h.placeContent, htmlGrid: h.gridTemplateRows, bodyDisplay: bd.display, bodyAlign: bd.alignItems, bodyJustify: bd.justifyContent, bodyGap: bd.rowGap, srRect: (() => { const e = document.getElementById('sr-announcer'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.top, q.height, getComputedStyle(e).position]; })() };
}), null, 1));
await b.close();
