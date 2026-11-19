import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const el = document.elementFromPoint(433, 244);
    const s = el ? getComputedStyle(el) : null;
    return el ? `${el.tagName}.${String(el.className).slice(0, 46)}|bg=${s.backgroundColor}|color=${s.color}|text=${el.textContent.trim().slice(0, 8)}` : null;
  });
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/kelola_pengguna_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin/pengguna'));
await b.close();
