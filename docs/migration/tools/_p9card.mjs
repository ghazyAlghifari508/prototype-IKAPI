import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/admin/moderasi-ulasan', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  const a = document.querySelector('#queue article');
  if (!a) return null;
  return { cls: a.className.slice(0, 40), buttons: [...a.querySelectorAll('button, a')].map((b) => b.textContent.replace(/\s+/g, ' ').trim().slice(0, 18)), text: a.innerText.replace(/\s+/g, ' ').slice(0, 60) };
}), null, 1));
await p.locator('#queue article').first().click();
await p.waitForTimeout(500);
console.log('drawer open:', await p.evaluate(() => !document.getElementById('mod-drawer').classList.contains('hidden')), 'delete disabled:', await p.evaluate(() => document.getElementById('btn-delete')?.disabled));
await b.close();
