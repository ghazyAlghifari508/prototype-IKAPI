import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => {
  const n = document.querySelector('#reply-list .thread-node');
  const hits = [];
  const walk = (rs, layer = '') => [...rs].forEach((r) => {
    if (r.cssRules && r.name !== undefined) walk([...r.cssRules], r.name || layer);
    else if (r.cssRules) walk([...r.cssRules], layer);
    else if (r.selectorText && /border/.test(r.cssText)) { try { if (n.matches(r.selectorText)) hits.push([layer, r.selectorText.slice(0, 50), r.style.borderBottomWidth || r.style.borderBottom || r.style.border]); } catch (e) {} }
  });
  for (const s of document.styleSheets) { try { walk([...s.cssRules]); } catch (e) {} }
  return { cls: n.className, hits: hits.slice(0, 6) };
}), null, 1));
await b.close();
