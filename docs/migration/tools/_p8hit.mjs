import { chromium } from 'playwright';
const b = await chromium.launch();
const hit = async (url, y) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate((y) => {
    window.scrollTo(0, Math.max(0, y - 300));
    const el = document.elementFromPoint(417, y - Math.max(0, y - 300));
    const stack = [];
    let n = el;
    for (let i = 0; i < 4 && n; i++) { stack.push(n.tagName + '.' + String(n.className).slice(0, 34) + '|' + (n.textContent || '').trim().slice(0, 24)); n = n.parentElement; }
    return stack;
  }, y);
  await ctx.close();
  return r;
};
console.log('P', await hit('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html', 709));
console.log('B', await hit('http://127.0.0.1:8140/penerbit/invoice', 709));
await b.close();
