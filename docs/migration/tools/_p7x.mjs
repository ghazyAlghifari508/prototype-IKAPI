import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => {
  const m = document.querySelector('main');
  // walk from main upward, printing (tag, rect.top, offsetTop, offsetParent, computed padding/margin/border)
  const out = [];
  let n = m;
  while (n && n.tagName) {
    const s = getComputedStyle(n);
    const q = n.getBoundingClientRect();
    out.push({
      node: n.tagName + (n.id ? '#' + n.id : ''),
      top: Math.round(q.top), offsetTop: n.offsetTop,
      pt: s.paddingTop, mt: s.marginTop, bt: s.borderTopWidth,
      pos: s.position, ov: s.overflow, transform: s.transform,
    });
    n = n.parentElement;
  }
  return out;
}), null, 1));
await b.close();
