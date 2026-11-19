import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const s = getComputedStyle(document.body, '::before');
  return { content: s.content, height: s.height, display: s.display, bodyDisplay: getComputedStyle(document.body).display };
})));
// then: what does removing the page <style> do?
await p.evaluate(() => { document.querySelectorAll('style').forEach((s, i) => { if (i === 1) s.remove(); }); });
await p.waitForTimeout(200);
console.log(JSON.stringify(await p.evaluate(() => ({ mainY: document.querySelector('main').getBoundingClientRect().top }))));
await b.close();
