import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const t = (el) => { let y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return Math.round(y); };
    const sheet = document.getElementById('invoice-sheet');
    return [...sheet.children].map((c) => [c.tagName + '.' + String(c.className).slice(0, 26), t(c), Math.round(c.getBoundingClientRect().height)]);
  });
  await ctx.close();
  return r;
};
const A = await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html');
const B = await dump('http://127.0.0.1:8140/penerbit/invoice');
console.log('P', JSON.stringify(A));
console.log('B', JSON.stringify(B));
await b.close();
