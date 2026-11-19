import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shot = async (url, file, injectFont) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  if (injectFont) {
    await p.evaluate(() => {
      document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]').forEach((l) => l.remove());
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap';
      document.head.appendChild(link);
    });
    await p.evaluate(async () => { await document.fonts.ready; });
  }
  await p.waitForTimeout(700);
  await p.screenshot({ path: file, fullPage: true });
  await ctx.close();
};
await shot('http://127.0.0.1:8099/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html', 'C:/Users/alghi/AppData/Local/Temp/inv-p.png', false);
await shot('http://127.0.0.1:8140/penerbit/invoice', 'C:/Users/alghi/AppData/Local/Temp/inv-b.png', false);
console.log('as-is', diff('C:/Users/alghi/AppData/Local/Temp/inv-p.png', 'C:/Users/alghi/AppData/Local/Temp/inv-b.png', {}).ratio?.toFixed(6));
await shot('http://127.0.0.1:8140/penerbit/invoice', 'C:/Users/alghi/AppData/Local/Temp/inv-b2.png', true);
console.log('same font url', diff('C:/Users/alghi/AppData/Local/Temp/inv-p.png', 'C:/Users/alghi/AppData/Local/Temp/inv-b2.png', {}).ratio?.toFixed(6));
await b.close();
