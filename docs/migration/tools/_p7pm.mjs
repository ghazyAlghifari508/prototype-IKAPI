import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const m = document.querySelector('main');
  const s = getComputedStyle(m);
  return { mt: s.marginTop, pt: s.paddingTop, cls: m.className, offsetTop: m.offsetTop, y: m.getBoundingClientRect().top, bodyCls: document.body.className.slice(0, 60), headerPos: getComputedStyle(document.querySelector('header')).position, headerH: document.querySelector('header').offsetHeight };
}), null, 1));
await b.close();
