import { chromium } from 'playwright';
const b = await chromium.launch();
const geo = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const box = (el) => { const q = el.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y + window.scrollY), Math.round(q.width), Math.round(q.height)]; };
    const view = ['view-room', 'view-topic', 'view-profile'].map((id) => document.getElementById(id)).filter((e) => e && !e.classList.contains('hidden'))[0];
    if (!view) return { view: null };
    return {
      view: view.id,
      box: box(view),
      kids: [...view.children].map((c) => [c.tagName + '.' + String(c.className).slice(0, 26), ...box(c)]),
    };
  });
  await ctx.close();
  return r;
};
console.log('P room', JSON.stringify(await geo('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(400); }), null, 1));
console.log('B room', JSON.stringify(await geo('http://127.0.0.1:8140/komunitas/community-filologi/diskusi'), null, 1));
await b.close();
