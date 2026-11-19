import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shoot = async (url, idx, file) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(400);
  const el = (await p.$$('#invoice-sheet > *'))[idx];
  await el.screenshot({ path: file });
  const tag = await el.evaluate((e) => e.tagName + '.' + e.className.slice(0, 30));
  await ctx.close();
  return tag;
};
for (let i = 0; i < 5; i++) {
  const t1 = await shoot('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html', i, 'C:/Users/alghi/AppData/Local/Temp/s-p.png');
  const t2 = await shoot('http://127.0.0.1:8140/penerbit/invoice', i, 'C:/Users/alghi/AppData/Local/Temp/s-b.png');
  const r = diff('C:/Users/alghi/AppData/Local/Temp/s-p.png', 'C:/Users/alghi/AppData/Local/Temp/s-b.png', {});
  console.log(i, t1, '|', t2, '| diff', r.diffPixels, (r.ratio || 0).toFixed(6));
}
await b.close();
