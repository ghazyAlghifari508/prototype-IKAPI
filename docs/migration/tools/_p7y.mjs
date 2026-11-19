import { chromium } from 'playwright';
const b = await chromium.launch();
const geo = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const box = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y + window.scrollY), Math.round(q.width), Math.round(q.height)]; };
    const main = document.querySelector('main');
    const kids = [...main.children].map((c) => [c.tagName + '#' + (c.id || '') + '.' + String(c.className).slice(0, 30), ...box(c)]);
    return { main: box(main), mainPad: getComputedStyle(main).paddingTop, kids, view: box(document.getElementById('view-room')) };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await geo('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(400); })));
console.log('B', JSON.stringify(await geo('http://127.0.0.1:8140/komunitas/community-filologi/diskusi')));
await b.close();
