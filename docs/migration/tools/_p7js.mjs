import { chromium } from 'playwright';
const b = await chromium.launch();
for (const js of [true, false]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: js });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    off: document.querySelector('main').offsetTop,
    bodyInline: document.body.getAttribute('style'),
    bodyKidsBeforeMain: [...document.body.children].slice(0, 4).map((c) => c.tagName + ':' + c.offsetHeight),
  }));
  console.log('js=' + js, JSON.stringify(r));
  await ctx.close();
}
await b.close();
