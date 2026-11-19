import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({
    tables: document.querySelectorAll('main table').length,
    rows: document.querySelectorAll('main table tbody tr').length,
    rowButtons: [...document.querySelectorAll('main table tbody tr')].slice(0, 2).map((tr) => [...tr.querySelectorAll('button, a')].map((b) => (b.id || b.getAttribute('data-action') || '-') + ':' + b.textContent.replace(/\s+/g, ' ').trim().slice(0, 18))),
    listItems: document.querySelectorAll('main ul > li, main article').length,
    mainButtons: [...document.querySelectorAll('main > div > button, main .no-print button')].slice(0, 6).map((b) => b.id || '-'),
  }));
  await ctx.close();
  console.log(label, JSON.stringify(r).slice(0, 700));
};
await dump('http://127.0.0.1:8140/admin/pengguna', 'users');
await dump('http://127.0.0.1:8140/admin/moderasi-ulasan', 'reviews');
await dump('http://127.0.0.1:8140/admin', 'dashboard');
await b.close();
