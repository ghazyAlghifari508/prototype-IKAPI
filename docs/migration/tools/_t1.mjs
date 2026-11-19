import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const t0 = Date.now();
const pending = new Set();
p.on('request', (r) => pending.add(r.url()));
p.on('requestfinished', (r) => pending.delete(r.url()));
p.on('requestfailed', (r) => { console.log('FAIL', r.url().slice(-50), r.failure()?.errorText); pending.delete(r.url()); });
try {
  await p.goto('http://127.0.0.1:8140/katalog', { waitUntil: 'domcontentloaded', timeout: 20000 });
  console.log('dcl', Date.now() - t0, 'images', await p.evaluate(() => document.images.length));
  await p.waitForLoadState('load', { timeout: 15000 }).then(() => console.log('load', Date.now() - t0)).catch((e) => console.log('load timeout', Date.now() - t0));
  console.log('still pending:', [...pending].map((u) => u.slice(-45)));
} catch (e) { console.log('ERR', String(e).slice(0, 200)); }
await b.close();
