import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/penerbit/pengaturan', { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.evaluate(() => document.getElementById('btn-bank-edit').click());
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  const box = (id) => { const el = document.getElementById(id); if (!el) return 'missing'; const q = el.getBoundingClientRect(); return { vis: el.offsetParent !== null && q.width > 0, box: [Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height)], hidden: el.classList.contains('hidden') }; };
  return { form: box('bank-form'), review: box('btn-bank-review'), cancel: box('btn-bank-cancel'), edit: box('btn-bank-edit') };
}), null, 1));
await b.close();
