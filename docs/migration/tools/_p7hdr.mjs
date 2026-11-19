import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => {
  const h = document.querySelector('header');
  const s = getComputedStyle(h);
  return { mb: s.marginBottom, mt: s.marginTop, h: h.offsetHeight, pos: s.position, bottom: s.bottom, top: s.top, cls: h.className.slice(0, 90) };
}), null, 1));
await b.close();
