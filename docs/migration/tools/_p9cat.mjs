import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/admin/katalog', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => ({
  rows: document.querySelectorAll('main table tbody tr').length,
  rowButtons: [...document.querySelectorAll('main table tbody tr')].slice(0, 3).map((tr) => [...tr.querySelectorAll('button, a')].map((b) => b.textContent.replace(/\s+/g, ' ').trim().slice(0, 16))),
  rowText: [...document.querySelectorAll('main table tbody tr')].slice(0, 2).map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 50)),
})), null, 1));
await p.locator('main table tbody tr').first().click({ position: { x: 30, y: 16 } });
await p.waitForTimeout(500);
console.log('drawer open:', await p.evaluate(() => !document.getElementById('catalog-drawer').classList.contains('hidden')));
console.log('drawer buttons:', await p.evaluate(() => [...document.querySelectorAll('#catalog-drawer button')].map((b) => b.id || '-')));
await b.close();
