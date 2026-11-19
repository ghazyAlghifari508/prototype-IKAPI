import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(450);
  const r = await p.evaluate(() => {
    const tr = [...document.querySelectorAll('main table tbody tr')].filter((x) => x.offsetParent !== null)[0];
    return tr ? { buttons: [...tr.querySelectorAll('button, a')].map((b) => (b.id || b.getAttribute('data-action') || '-') + ':' + b.textContent.replace(/\s+/g, ' ').trim().slice(0, 14)), cls: tr.className.slice(0, 40) } : null;
  });
  await ctx.close();
  console.log(label, JSON.stringify(r));
};
await dump('http://127.0.0.1:8140/admin/pencairan', 'payouts');
await dump('http://127.0.0.1:8140/admin/komunitas', 'communities');
await dump('http://127.0.0.1:8140/admin/moderasi-diskusi', 'discussion');
await b.close();
