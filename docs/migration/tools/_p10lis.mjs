import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  window.__submits = 0;
  const orig = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (type === 'submit' && this && this.id === 'reply-view-form') window.__submits++;
    return orig.call(this, type, fn, opts);
  };
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-2026-201', { waitUntil: 'load' });
await p.waitForTimeout(800);
console.log('submit listeners on #reply-view-form:', await p.evaluate(() => window.__submits));
console.log('initCommunity runs? check body marker:', await p.evaluate(() => typeof window.IkapiCommunity));
await b.close();
