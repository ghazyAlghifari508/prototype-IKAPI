import { chromium } from 'playwright';
const b = await chromium.launch();
const geo = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const t = (el) => { let y = 0; let n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; };
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    return { mainTop: t(main), mainH: main.offsetHeight, footerTop: t(footer), footerH: footer.offsetHeight, scrollH: document.documentElement.scrollHeight, headerPos: getComputedStyle(document.querySelector('header')).position };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await geo('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-filologi', async (p) => { await p.click('#btn-open-room-inline'); await p.waitForTimeout(300); })));
console.log('B', JSON.stringify(await geo('http://127.0.0.1:8140/komunitas/community-filologi/diskusi')));
await b.close();
