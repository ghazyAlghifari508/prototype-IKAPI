import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 80)); });
await p.goto('http://127.0.0.1:8140/keranjang', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
console.log(await p.evaluate(() => ({
  favButtons: document.querySelectorAll('.btn-fav').length,
  items: document.querySelectorAll('article[id^="cart-item-"]').length,
  rowButtons: [...document.querySelectorAll('article[id^="cart-item-"] .mt-4 button')].map((b) => b.getAttribute('aria-label')),
  total: (document.querySelector('#summary-total, [data-summary-total]')?.textContent || '').trim(),
})));
console.log('errors', errs);
await b.close();
