import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const table = document.querySelector('#invoice-sheet table');
    const th = table.querySelector('thead tr');
    const cs = (el) => { const s = getComputedStyle(el); return { h: +el.getBoundingClientRect().height.toFixed(2), pt: s.paddingTop, pb: s.paddingBottom, fs: s.fontSize, lh: s.lineHeight, bs: s.boxShadow.slice(0, 20) }; };
    return { thead: cs(th), thCell: cs(table.querySelector('thead th')), table: cs(table), sheetText: getComputedStyle(document.getElementById('invoice-sheet')).fontFamily.slice(0, 20) };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html')));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/penerbit/invoice')));
await b.close();
