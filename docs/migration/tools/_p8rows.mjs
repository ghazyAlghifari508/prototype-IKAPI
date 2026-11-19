import { chromium } from 'playwright';
const b = await chromium.launch();
const rows = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const t = (el) => { let y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; };
    return [...document.querySelectorAll('#invoice-sheet table tbody tr')].map((tr) => [t(tr), Math.round(tr.getBoundingClientRect().height)]);
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await rows('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html')));
console.log('B', JSON.stringify(await rows('http://127.0.0.1:8140/penerbit/invoice')));
await b.close();
