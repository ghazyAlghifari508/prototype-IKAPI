import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, label, sel) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((el) => [el.id || el.getAttribute('data-action') || '-', el.textContent.replace(/\s+/g, ' ').trim().slice(0, 24)]).filter((x) => x[1] && !/Mode Demo|Berisi|Buka Balasan|Validasi|Sedang|Sukses|Detail Pencairan|Gagal|Saldo|Rekening|Ulasan|Pencarian|Katalog|Filter Draft|Modal Hentikan/.test(x[1])), sel);
  await ctx.close();
  console.log('##', label, JSON.stringify(r).slice(0, 800));
};
await dump('http://127.0.0.1:8140/penerbit/keuangan', 'finance', 'main button');
await dump('http://127.0.0.1:8140/penerbit/ulasan', 'reviews', 'main button');
await dump('http://127.0.0.1:8140/penerbit/buku', 'books', 'main button');
await b.close();
