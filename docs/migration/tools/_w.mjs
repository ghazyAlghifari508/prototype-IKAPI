import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shot = async (url, file) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.addStyleTag({ content: '#ikapi-chat-widget-wrapper{display:none !important}' });
  await p.waitForTimeout(400);
  await p.screenshot({ path: file, fullPage: true });
  await ctx.close();
};
await shot('http://127.0.0.1:8099/prototype-copy/user/chatbot_bantuan_rekomendasi_desktop.html', 'C:/Users/alghi/AppData/Local/Temp/w-p.png');
await shot('http://127.0.0.1:8140/akun/bantuan/chatbot', 'C:/Users/alghi/AppData/Local/Temp/w-b.png');
const r = diff('C:/Users/alghi/AppData/Local/Temp/w-p.png', 'C:/Users/alghi/AppData/Local/Temp/w-b.png', { threshold: 1 });
console.log('widget hidden diff', r.diffPixels, (r.ratio || 0).toFixed(6));
await b.close();
