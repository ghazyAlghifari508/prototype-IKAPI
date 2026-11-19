import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shot = async (url, file) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(500);
  await p.screenshot({ path: file, fullPage: true });
  await ctx.close();
};
const url = 'http://127.0.0.1:8099/prototype-copy/user/lupa_kata_sandi_desktop.html';
await shot(url, 'C:/Users/alghi/AppData/Local/Temp/self-a.png');
await shot(url, 'C:/Users/alghi/AppData/Local/Temp/self-b.png');
const r = diff('C:/Users/alghi/AppData/Local/Temp/self-a.png', 'C:/Users/alghi/AppData/Local/Temp/self-b.png', {});
console.log('proto vs proto diffPixels:', r.diffPixels, 'ratio:', (r.ratio ?? 0).toFixed(6));
await b.close();
