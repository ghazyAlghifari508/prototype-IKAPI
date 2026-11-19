import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-filologi/diskusi', { waitUntil: 'load' });
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => [...document.body.children].map((c) => {
  const q = c.getBoundingClientRect();
  return [c.tagName + '#' + (c.id || ''), Math.round(q.y + window.scrollY), Math.round(q.height), getComputedStyle(c).position, String(c.className).slice(0, 40)];
})), null, 1));
await b.close();
