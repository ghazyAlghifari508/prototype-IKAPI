import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shot = async (url, file) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.addStyleTag({ content: '*{caret-color:transparent !important}' });
  await p.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: file, fullPage: true });
  await ctx.close();
};
await shot('http://127.0.0.1:8140/agenda', 'C:/Users/alghi/AppData/Local/Temp/a1.png');
await shot('http://127.0.0.1:8140/agenda', 'C:/Users/alghi/AppData/Local/Temp/a2.png');
const r = diff('C:/Users/alghi/AppData/Local/Temp/a1.png', 'C:/Users/alghi/AppData/Local/Temp/a2.png', { threshold: 8 });
console.log('blade vs blade (t8):', r.diffPixels, (r.ratio || 0).toFixed(6));
await b.close();
