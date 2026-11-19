import { chromium } from 'playwright';
const b = await chromium.launch();
const check = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(700);
  if (prep) await prep(p);
  const r = await p.evaluate(() => ({
    bars: [...document.querySelectorAll('[id^="top-back-"]')].map((e) => e.id + ':' + (e.classList.contains('hidden') ? 'hidden' : Math.round(e.getBoundingClientRect().height))),
    qa: (() => { const e = document.getElementById('qa-simulation-panel'); return e ? (e.classList.contains('hidden') ? 'hidden' : Math.round(e.getBoundingClientRect().height)) : null; })(),
    h: document.documentElement.scrollHeight,
  }));
  await ctx.close();
  return r;
};
console.log('P room', JSON.stringify(await check('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(400); })));
console.log('B room', JSON.stringify(await check('http://127.0.0.1:8140/komunitas/community-filologi/diskusi')));
console.log('P topic', JSON.stringify(await check('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101')));
console.log('B topic', JSON.stringify(await check('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101')));
await b.close();
