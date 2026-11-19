import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({
    buttons: [...document.querySelectorAll('main button')].slice(0, 22).map((el) => [el.id || '-', (el.getAttribute('data-action') || el.getAttribute('data-more') || el.getAttribute('data-filter') || ''), el.textContent.replace(/\s+/g, ' ').trim().slice(0, 22)]),
    inputs: [...document.querySelectorAll('main input, main select, main textarea')].slice(0, 12).map((el) => [el.tagName.toLowerCase(), el.id || '-', el.type]),
    rows: document.querySelectorAll('main table tbody tr').length,
  }));
  await ctx.close();
  console.log('##', label, JSON.stringify(r, null, 1).slice(0, 1400));
};
await dump('http://127.0.0.1:8140/penerbit/buku', 'books');
await dump('http://127.0.0.1:8140/penerbit/pesanan', 'orders');
await b.close();
