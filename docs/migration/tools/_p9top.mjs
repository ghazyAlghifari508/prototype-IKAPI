import { chromium } from 'playwright';
const b = await chromium.launch();
const probe = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const el = document.getElementById('btn-add');
    const q = el.getBoundingClientRect();
    const top = document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2);
    return { top: top ? top.tagName + '#' + (top.id || '-') + '.' + String(top.className).slice(0, 30) : null, isSelf: top === el };
  });
  await ctx.close();
  return r;
};
console.log('blade', JSON.stringify(await probe('http://127.0.0.1:8140/admin/komunitas')));
console.log('proto', JSON.stringify(await probe('http://127.0.0.1:8099/prototype-copy/admin/kelola_komunitas_desktop.html')));
await b.close();
