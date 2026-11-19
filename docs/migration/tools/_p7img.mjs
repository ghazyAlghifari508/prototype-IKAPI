import { chromium } from 'playwright';
const b = await chromium.launch();
const info = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const imgs = [...document.images].map((i) => ({ src: i.getAttribute('src'), nat: [i.naturalWidth, i.naturalHeight], box: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)], cls: i.className.slice(0, 60) }));
    return { imgs, header: document.querySelector('header')?.getBoundingClientRect().height, mainPt: getComputedStyle(document.querySelector('main')).paddingTop };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await info('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html').then(r => ({header: r.header, mainPt: r.mainPt, imgs: r.imgs.slice(0, 3)})), null, 1));
console.log('B', JSON.stringify(await info('http://127.0.0.1:8140/komunitas').then(r => ({header: r.header, mainPt: r.mainPt, imgs: r.imgs.slice(0, 3)})), null, 1));
await b.close();
