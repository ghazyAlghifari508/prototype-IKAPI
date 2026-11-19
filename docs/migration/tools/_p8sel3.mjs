import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label, sel) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate((sel) => ({
    targets: [...document.querySelectorAll(sel)].map((el) => [el.tagName.toLowerCase(), el.id || '-', el.className.slice(0, 34), el.textContent.replace(/\s+/g, ' ').trim().slice(0, 20)]),
  }), sel);
  await ctx.close();
  console.log('##', label, JSON.stringify(r).slice(0, 900));
};
await dump('http://127.0.0.1:8140/penerbit/ulasan', 'reviews-buttons', 'main button, main textarea');
await dump('http://127.0.0.1:8140/penerbit/keuangan', 'finance-buttons', 'main button');
await dump('http://127.0.0.1:8140/penerbit/buku', 'books-sortish', 'main select, main [role="tab"], main [data-sort]');
await b.close();
