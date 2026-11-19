import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const row = document.querySelector('#book-rows tr[data-id]') || document.querySelector('main table tbody tr');
    return {
      rowButtons: row ? [...row.querySelectorAll('button')].map((el) => [el.id || '-', el.className.slice(0, 30), el.textContent.replace(/\s+/g, ' ').trim().slice(0, 18)]) : null,
      inputs: [...document.querySelectorAll('main input, main select')].map((el) => [el.id || '-', el.type, el.name || '']),
      tableId: row ? row.closest('table').id : null,
    };
  });
  await ctx.close();
  console.log('##', label, JSON.stringify(r));
};
await dump('http://127.0.0.1:8140/penerbit/buku', 'books');
await dump('http://127.0.0.1:8140/penerbit/pesanan', 'orders');
await dump('http://127.0.0.1:8140/penerbit/keuangan', 'finance');
await dump('http://127.0.0.1:8140/penerbit/ulasan', 'reviews');
await b.close();
