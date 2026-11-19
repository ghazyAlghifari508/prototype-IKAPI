import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  const main = document.querySelector('main');
  const sib = main.previousElementSibling;
  const cs = sib ? getComputedStyle(sib) : null;
  return {
    prev: sib ? sib.tagName + '#' + (sib.id || '') : null,
    prevRect: sib ? (() => { const q = sib.getBoundingClientRect(); return [q.top, q.height]; })() : null,
    prevPos: cs ? cs.position : null,
    prevDisplay: cs ? cs.display : null,
    headerParent: document.querySelector('header') ? document.querySelector('header').parentElement.tagName : null,
    headerSiblingNext: document.querySelector('header') && document.querySelector('header').nextElementSibling ? document.querySelector('header').nextElementSibling.tagName + '#' + document.querySelector('header').nextElementSibling.id : null,
  };
}), null, 1));
await b.close();
