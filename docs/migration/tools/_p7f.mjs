import { chromium } from 'playwright';
const b = await chromium.launch();
const f = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const foot = document.querySelector('footer');
    const q = foot.getBoundingClientRect();
    return { top: Math.round(q.y + window.scrollY), h: Math.round(q.height), scrollH: document.documentElement.scrollHeight, bodyH: document.body.getBoundingClientRect().height };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await f('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(300); })));
console.log('B', JSON.stringify(await f('http://127.0.0.1:8140/komunitas/community-filologi/diskusi')));
await b.close();
