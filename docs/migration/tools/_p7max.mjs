import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas', { waitUntil: 'load' });
const r = await p.evaluate(() => {
  const img = [...document.images].find((i) => i.getAttribute('src').includes('komunitasil'));
  const s = getComputedStyle(img);
  const rules = [];
  const walk = (rs, layer = '') => [...rs].forEach((rule) => {
    if (rule.cssRules) walk(rule.cssRules, rule.name || layer);
    else if (rule.selectorText && /max-height|max-h/.test(rule.cssText)) {
      try { if (img.matches(rule.selectorText)) rules.push([layer, rule.selectorText.slice(0, 40), rule.style.maxHeight]); } catch (e) {}
    }
  });
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch (e) {} }
  return { maxH: s.maxHeight, height: s.height, cls: img.className, rules };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
