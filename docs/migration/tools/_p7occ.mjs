import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-filologi/diskusi', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => {
  window.scrollTo(0, 0);
  const stack = [];
  for (const y of [20, 50, 70, 90]) {
    const el = document.elementFromPoint(700, y);
    stack.push([y, el ? el.tagName + '#' + (el.id || '') + '.' + String(el.className).slice(0, 30) : null]);
  }
  const main = document.querySelector('main');
  const body = document.body;
  return { stack, bodyPad: getComputedStyle(body).paddingTop, bodyMT: getComputedStyle(body).marginTop, mainMT: getComputedStyle(main).marginTop, mainOffsetTop: main.offsetTop, bodyOffsetTop: body.offsetTop, bodyKids: [...body.children].filter(c => c.offsetHeight > 0).map(c => c.tagName + '#' + (c.id||'') + ':' + c.offsetTop + '/' + c.offsetHeight) };
}), null, 1));
await b.close();
