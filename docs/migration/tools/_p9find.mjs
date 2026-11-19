import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const hits = [];
    for (const el of document.querySelectorAll('main *')) {
      const q = el.getBoundingClientRect();
      const absTop = q.top + window.scrollY;
      const s = getComputedStyle(el);
      for (const [edge, y] of [['top', absTop], ['bottom', absTop + q.height]]) {
        if (Math.abs(y - 823) < 0.6 || Math.abs(y - 847) < 0.6) {
          const w = edge === 'top' ? s.borderTopWidth : s.borderBottomWidth;
          const c = edge === 'top' ? s.borderTopColor : s.borderBottomColor;
          if (w !== '0px') hits.push(`${el.tagName}.${String(el.className).slice(0, 40)}|${edge}|${w}|${c}|y=${Math.round(y)}`);
        }
      }
    }
    return hits.slice(0, 6);
  });
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin'));
await b.close();
