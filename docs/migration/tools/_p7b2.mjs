import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => ({
    scrollH: document.documentElement.scrollHeight,
    bodyKids: [...document.body.children].filter((c) => !['SCRIPT','STYLE','LINK','META','TITLE'].includes(c.tagName)).map((c) => [c.tagName + '#' + (c.id || ''), c.offsetHeight, getComputedStyle(c).display]),
  }));
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(300); }), null, 1));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/komunitas/community-filologi/diskusi'), null, 1));
await b.close();
