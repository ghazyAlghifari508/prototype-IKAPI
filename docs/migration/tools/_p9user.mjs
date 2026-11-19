import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('main table tbody tr')].slice(0, 2);
    return rows.map((tr) => {
      const s = getComputedStyle(tr);
      const td = tr.querySelector('td');
      const q = tr.getBoundingClientRect();
      return `h=${Math.round(q.height)}|bt=${s.borderTopWidth}/${s.borderTopColor}|bb=${s.borderBottomWidth}/${s.borderBottomColor}|td=${getComputedStyle(td).paddingTop}`;
    });
  });
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/kelola_pengguna_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin/pengguna'));
await b.close();
