import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const tds = [...document.querySelectorAll('#invoice-sheet table tbody tr:first-child td')];
    const price = tds[2];
    const s = getComputedStyle(price);
    return { cls: price.className, fvn: s.fontVariantNumeric, ffs: s.fontFeatureSettings, fk: s.fontKerning, fo: s.fontOpticalSizing, smooth: s.webkitFontSmoothing };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html')));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/penerbit/invoice')));
await b.close();
