import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(300);
const r = await p.evaluate(() => [...document.body.children].map((c, i) => `${i}:${c.tagName}${c.id ? '#' + c.id : ''}:${c.offsetHeight}:${getComputedStyle(c).position}`));
console.log(r.join('\n'));
await b.close();
