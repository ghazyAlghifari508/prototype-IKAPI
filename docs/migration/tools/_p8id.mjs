import { chromium } from 'playwright';
const b = await chromium.launch();
const check = async (url, ids) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('  ERR', String(e).slice(0, 90)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const missing = await p.evaluate((ids) => ids.filter((id) => !document.getElementById(id)), ids);
  console.log(url.replace('http://127.0.0.1:8140',''), 'missing:', missing);
  await ctx.close();
};
await check('http://127.0.0.1:8140/penerbit/buku', ['book-search','book-rows','btn-add','row-menu','modal-detail','modal-book','modal-unpublish']);
await check('http://127.0.0.1:8140/penerbit/keuangan', ['btn-export','payout-table','modal-confirm','modal-success','modal-detail']);
await check('http://127.0.0.1:8140/penerbit/pengaturan', ['profile-form','btn-bank-review','modal-bank-confirm','modal-unsaved','toast']);
await b.close();
