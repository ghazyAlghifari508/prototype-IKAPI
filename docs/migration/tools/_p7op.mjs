import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const main = document.querySelector('main');
  const op = main.offsetParent;
  return {
    mainOffsetParent: op ? op.tagName + '#' + (op.id || '') : null,
    mainOffsetTop: main.offsetTop,
    opTop: op ? op.offsetTop : null,
    rootChildren: [...document.documentElement.children].map((c) => c.tagName + ':' + c.offsetTop + '/' + c.offsetHeight),
    bodyCls: document.body.className,
    rootCls: document.documentElement.className,
    rootPad: getComputedStyle(document.documentElement).paddingTop,
    rootMargin: getComputedStyle(document.documentElement).marginTop,
  };
}), null, 1));
await b.close();
