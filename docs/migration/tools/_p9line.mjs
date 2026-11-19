import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    window.scrollTo(0, 500);
    const el = document.elementFromPoint(1250, 823 - 500);
    const stack = [];
    let n = el;
    for (let i = 0; i < 4 && n; i++) {
      const s = getComputedStyle(n);
      stack.push(`${n.tagName}.${String(n.className).slice(0, 34)}|bt=${s.borderTopWidth}/${s.borderTopColor}|bb=${s.borderBottomWidth}/${s.borderBottomColor}`);
      n = n.parentElement;
    }
    return stack;
  });
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin'));
await b.close();
