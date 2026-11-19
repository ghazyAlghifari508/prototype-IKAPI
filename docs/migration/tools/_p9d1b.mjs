import { chromium } from 'playwright';
const b = await chromium.launch();
const probe = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 110)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  await p.locator('main table tbody tr button').first().click().catch(() => {});
  await p.waitForTimeout(500);
  const opened = await p.evaluate(() => !document.getElementById('payout-drawer')?.classList.contains('hidden'));
  const fin = await p.evaluate(() => !document.getElementById('btn-finalize')?.disabled);
  if (fin) { await p.evaluate(() => document.getElementById('btn-finalize').click()); await p.waitForTimeout(500); }
  const modal = await p.evaluate(() => !document.getElementById('modal-finalize')?.classList.contains('hidden'));
  await ctx.close();
  return { opened, fin, modal, errs };
};
console.log('proto', JSON.stringify(await probe('http://127.0.0.1:8099/prototype-copy/admin/kelola_pencairan_dana_desktop.html')));
console.log('blade', JSON.stringify(await probe('http://127.0.0.1:8140/admin/pencairan')));
await b.close();
