import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', { waitUntil: 'load' });
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => [...document.body.children].map((c) => {
  const q = c.getBoundingClientRect();
  return [c.tagName + '#' + (c.id || ''), Math.round(q.y + window.scrollY), Math.round(q.height), getComputedStyle(c).display];
})), null, 1));
await b.close();
