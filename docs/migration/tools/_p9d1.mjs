import { chromium } from 'playwright';
const b = await chromium.launch();
const probe = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  // open the payout drawer the way the row action does
  await p.locator('main table tbody tr').first().click({ position: { x: 30, y: 16 } }).catch(async () => {
    await p.locator('main table tbody tr button').first().click().catch(() => {});
  });
  await p.waitForTimeout(500);
  const opened = await p.evaluate(() => !document.getElementById('payout-drawer')?.classList.contains('hidden'));
  const err2 = [...errs];
  await ctx.close();
  return { opened, errs: err2 };
};
console.log('proto', JSON.stringify(await probe('http://127.0.0.1:8099/prototype-copy/admin/kelola_pencairan_dana_desktop.html')));
console.log('blade', JSON.stringify(await probe('http://127.0.0.1:8140/admin/pencairan')));
await b.close();
