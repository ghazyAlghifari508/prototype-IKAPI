import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, drawer, openRow) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  await p.locator('main table tbody tr').first().click({ position: { x: 30, y: 16 } });
  await p.waitForTimeout(500);
  const r = await p.evaluate((drawer) => ({
    open: !document.getElementById(drawer)?.classList.contains('hidden'),
    buttons: [...document.querySelectorAll('#' + drawer + ' button')].map((b) => [b.id || '-', b.textContent.replace(/\s+/g, ' ').trim().slice(0, 26)]),
    esc: null,
  }), drawer);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  r.escClosesDrawer = await p.evaluate((drawer) => document.getElementById(drawer)?.classList.contains('hidden'), drawer);
  await ctx.close();
  return r;
};
console.log('users', JSON.stringify(await dump('http://127.0.0.1:8140/admin/pengguna', 'user-drawer')));
console.log('catalog', JSON.stringify(await dump('http://127.0.0.1:8140/admin/katalog', 'catalog-drawer')));
console.log('payouts', JSON.stringify(await dump('http://127.0.0.1:8140/admin/pencairan', 'payout-drawer')));
console.log('reviews', JSON.stringify(await dump('http://127.0.0.1:8140/admin/moderasi-ulasan', 'mod-drawer')));
await b.close();
