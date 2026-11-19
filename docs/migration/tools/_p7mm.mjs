import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const root = document.getElementById('community-root');
  const main = document.querySelector('main');
  const cs = (el) => { const s = getComputedStyle(el); return { mt: s.marginTop, pt: s.paddingTop, pos: s.position, top: s.top, h: el.offsetHeight, y: el.getBoundingClientRect().top }; };
  return {
    main: cs(main),
    root: cs(root),
    firstChild: root ? cs(root.firstElementChild) : null,
    headerCS: cs(document.querySelector('header')),
  };
}), null, 1));
await b.close();
