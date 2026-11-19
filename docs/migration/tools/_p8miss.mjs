import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:8140/penerbit/pengaturan', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(await p.evaluate(() => {
  const misses = [];
  const orig = document.getElementById.bind(document);
  document.getElementById = function (id) { const el = orig(id); if (!el) misses.push(id); return el; };
  window.dispatchEvent(new Event('x'));
  document.getElementById = orig;
  return 'ok';
}));
await b.close();
