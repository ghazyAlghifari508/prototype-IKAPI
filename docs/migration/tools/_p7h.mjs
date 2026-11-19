import { chromium } from 'playwright';
const b = await chromium.launch();
const geo = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const h = (el) => el ? el.offsetHeight : null;
    const main = document.querySelector('main');
    const view = ['view-explore','view-profile','view-room','view-topic','view-reply'].map((id) => document.getElementById(id)).filter((e) => e && !e.classList.contains('hidden'))[0];
    return {
      mainH: h(main), mainKids: [...main.children].map((c) => [c.tagName + '#' + (c.id || ''), c.offsetHeight]),
      footerH: h(document.querySelector('footer')),
      viewH: h(view),
      viewKids: view ? [...view.children].map((c) => [c.tagName + '.' + String(c.className).slice(0, 22), c.offsetHeight]) : null,
    };
  });
  await ctx.close();
  return r;
};
const prep = async (p) => { await p.click('#btn-open-room-inline').catch(() => {}); await p.waitForTimeout(300); };
console.log('P', JSON.stringify(await geo('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.waitForTimeout(200); await prep(p); }), null, 1));
console.log('B', JSON.stringify(await geo('http://127.0.0.1:8140/komunitas/community-filologi/diskusi'), null, 1));
await b.close();
