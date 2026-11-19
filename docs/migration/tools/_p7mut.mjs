import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(300);
const t = async (label) => console.log(label, await p.evaluate(() => ({ off: document.querySelector('main').offsetTop, y: Math.round(document.querySelector('main').getBoundingClientRect().top), bodyH: Math.round(document.body.getBoundingClientRect().height) })));
await t('base');
await p.evaluate(() => { document.body.style.display = 'block'; document.body.style.flexDirection = ''; document.body.style.justifyContent = ''; document.body.style.alignItems = ''; });
await t('body display block');
await p.evaluate(() => { document.querySelector('main').style.paddingTop = '112px'; });
await t('pt-28');
await p.evaluate(() => { document.querySelector('footer').style.display = 'none'; });
await t('footer none');
console.log(JSON.stringify(await p.evaluate(() => {
  const bs = getComputedStyle(document.body);
  return { display: bs.display, flexDirection: bs.flexDirection, justifyContent: bs.justifyContent, alignItems: bs.alignItems, minHeight: bs.minHeight, height: bs.height };
})));
await b.close();
