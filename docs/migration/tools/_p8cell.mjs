import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const tr = document.querySelector('#invoice-sheet table tbody tr');
    return [...tr.children].map((td) => {
      const q = td.getBoundingClientRect();
      return [td.tagName, Math.round(q.x), Math.round(q.width), td.textContent.replace(/\s+/g, ' ').trim().slice(0, 28), getComputedStyle(td).textAlign];
    });
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html'), null, 0));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/penerbit/invoice'), null, 0));
await b.close();
