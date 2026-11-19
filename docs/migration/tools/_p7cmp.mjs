import { chromium } from 'playwright';
const b = await chromium.launch();
const t = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ mainTop: document.querySelector('main').offsetTop, scrollH: document.documentElement.scrollHeight, headerH: document.querySelector('header').offsetHeight, headerPos: getComputedStyle(document.querySelector('header')).position }));
  await ctx.close();
  return r;
};
for (const u of ['http://127.0.0.1:8140/katalog', 'http://127.0.0.1:8140/komunitas', 'http://127.0.0.1:8140/akun/bantuan']) console.log(u.replace('http://127.0.0.1:8140',''), JSON.stringify(await t(u)));
await b.close();
