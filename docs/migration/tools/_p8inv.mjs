import { chromium } from 'playwright';
const b = await chromium.launch();
const probe = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const box = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height)]; };
    const btn = document.getElementById('btn-print');
    const bar = document.querySelector('.no-print');
    const s = btn ? getComputedStyle(btn) : null;
    return {
      btn: btn ? { box: box(btn), bg: s.backgroundColor, color: s.color, outline: s.outlineWidth, shadow: s.boxShadow.slice(0, 30), text: btn.textContent.trim() } : null,
      bar: bar ? { box: box(bar), bg: getComputedStyle(bar).backgroundColor } : null,
      sheet: box(document.getElementById('invoice-sheet')),
      rows: [...document.querySelectorAll('#invoice-sheet table tbody tr')].length,
    };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await probe('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html'), null, 1));
console.log('B', JSON.stringify(await probe('http://127.0.0.1:8140/penerbit/invoice'), null, 1));
await b.close();
