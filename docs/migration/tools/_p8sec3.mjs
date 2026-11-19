import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const sec = document.querySelectorAll('#invoice-sheet > *')[3];
    return [...sec.querySelectorAll('*')].slice(0, 24).map((el) => {
      const q = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return `${el.tagName}.${String(el.className).slice(0, 22)}|${Math.round(q.x)},${Math.round(q.width)}|${s.textAlign}|${s.fontSize}|${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 18)}`;
    });
  });
  await ctx.close();
  return r;
};
const A = await dump('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html');
const B = await dump('http://127.0.0.1:8140/penerbit/invoice');
for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) console.log('P', A[i], '\nB', B[i]);
await b.close();
