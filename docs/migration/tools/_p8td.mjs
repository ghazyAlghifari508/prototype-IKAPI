import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const td = document.querySelector('#invoice-sheet table tbody tr td');
    const span = td.querySelector('span');
    const cs = (el) => { const s = getComputedStyle(el); const q = el.getBoundingClientRect(); return { y: +q.y.toFixed(2), h: +q.height.toFixed(2), fs: s.fontSize, lh: s.lineHeight, ls: s.letterSpacing, fw: s.fontWeight, ff: s.fontFamily.slice(0, 18), ws: s.wordSpacing }; };
    return { td: cs(td), span: cs(span), bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 30), htmlCls: document.documentElement.className };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html')));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/penerbit/invoice')));
await b.close();
