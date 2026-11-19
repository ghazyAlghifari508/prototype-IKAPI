import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8099/prototype-copy/penerbit/dashboard_penerbit_desktop.html', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => {
  const grab = (id) => { const el = document.getElementById(id); return el ? el.textContent.trim() : null; };
  return ['kpi-books-val','kpi-books-sub','kpi-sold-val','kpi-sold-sub','kpi-revenue-val','kpi-balance-val'].map((id) => id + '=' + grab(id));
}), null, 1));
await b.close();
