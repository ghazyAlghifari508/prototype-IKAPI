import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(() => {
  const n = document.querySelector('#reply-list .thread-node');
  const s = getComputedStyle(n);
  return { styleAttr: n.getAttribute('style'), bbStyle: s.borderBottomStyle, bbColor: s.borderBottomColor, bbW: s.borderBottomWidth, parentCls: n.parentElement.className, isLast: !n.nextElementSibling };
}), null, 1));
await b.close();
