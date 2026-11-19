import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shot = async (url, file) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(400);
  const info = await p.evaluate(() => {
    const img = document.querySelector('main img');
    const cs = getComputedStyle(img);
    return { box: img.getBoundingClientRect().toJSON(), filter: cs.filter, w: cs.width, h: cs.height, shadow: cs.boxShadow };
  });
  const el = await p.$('main img');
  await el.screenshot({ path: file });
  await ctx.close();
  return info;
};
console.log('P', JSON.stringify(await shot('http://127.0.0.1:8099/prototype-copy/user/lupa_kata_sandi_desktop.html', 'C:/Users/alghi/AppData/Local/Temp/ip.png')));
console.log('B', JSON.stringify(await shot('http://127.0.0.1:8140/lupa-kata-sandi', 'C:/Users/alghi/AppData/Local/Temp/ib.png')));
const r = diff('C:/Users/alghi/AppData/Local/Temp/ip.png', 'C:/Users/alghi/AppData/Local/Temp/ib.png', {});
console.log('img-only diff', r.diffPixels, r.ratio?.toFixed(6), r.sizeMismatch ? `sizes ${r.aSize} ${r.bSize}` : '');
await b.close();
