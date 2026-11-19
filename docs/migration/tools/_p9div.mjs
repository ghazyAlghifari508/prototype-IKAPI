import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => [...document.querySelectorAll('main [class*="divider"]')].slice(0, 6).map((el) => {
    const s = getComputedStyle(el);
    const q = el.getBoundingClientRect();
    return `${el.tagName}.${String(el.className).slice(0, 30)}|${Math.round(q.y)}|bt=${s.borderTopColor}|bb=${s.borderBottomColor}|bg=${s.backgroundColor}`;
  }));
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin'));
await b.close();
