import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8140/admin/komunitas', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const el = document.getElementById('btn-add');
  if (!el) return null;
  const q = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  return { tag: el.tagName, box: [Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height)], disp: s.display, vis: s.visibility, disabled: el.disabled ?? null, text: el.textContent.trim() };
}), null, 1));
console.log('rows:', await p.evaluate(() => document.querySelectorAll('#community-rows tr').length));
await b.close();
