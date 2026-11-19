import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  window.scrollTo(0, 0);
  const r = (el) => { const q = el.getBoundingClientRect(); return [q.top, q.height]; };
  return {
    html: r(document.documentElement), body: r(document.body), main: r(document.querySelector('main')),
    scrollY: window.scrollY, htmlPad: getComputedStyle(document.documentElement).paddingTop, htmlBorder: getComputedStyle(document.documentElement).borderTopWidth,
    bodyBorder: getComputedStyle(document.body).borderTopWidth,
  };
}), null, 1));
await b.close();
