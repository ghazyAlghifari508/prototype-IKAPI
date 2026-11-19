import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-filologi/diskusi', { waitUntil: 'load' });
console.log(JSON.stringify(await p.evaluate(() => {
  const m = document.querySelector('main');
  const cs = getComputedStyle(m);
  const bs = getComputedStyle(document.body);
  const hs = getComputedStyle(document.documentElement);
  return {
    main: { mt: cs.marginTop, pt: cs.paddingTop, pos: cs.position, top: cs.top },
    body: { mt: bs.marginTop, pt: bs.paddingTop },
    html: { mt: hs.marginTop },
    firstChildOfBodyFlow: [...document.body.children].filter((c) => getComputedStyle(c).position !== 'fixed' && c.offsetHeight > 0).slice(0, 3).map((c) => c.tagName + ':' + c.offsetHeight),
  };
}), null, 1));
await b.close();
