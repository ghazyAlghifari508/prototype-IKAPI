// P03 fixture extraction - pulls the real fixture arrays out of the prototype pages (no invention).
// Usage: node docs/migration/tools/extract-fixtures.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const O = 'http://127.0.0.1:8099/prototype-copy';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/data/ikapi';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();

const JOBS = [
  {
    file: 'books.json',
    url: 'user/katalog_buku_desktop.html',
    expr: `(() => { const v = (typeof rawCatalogBooks !== 'undefined') ? rawCatalogBooks : null; return v; })()`,
  },
  {
    file: 'communities.json',
    url: 'user/komunitas_literasi_desktop.html',
    expr: `(() => { const v = (typeof communitiesData !== 'undefined') ? communitiesData : null; return v; })()`,
  },
  {
    file: 'orders.json',
    url: 'user/riwayat_pesanan_desktop.html',
    expr: `(() => { const v = (typeof ordersData !== 'undefined') ? ordersData : null; return v; })()`,
  },
  {
    file: 'users.json',
    url: 'admin/kelola_pengguna_desktop.html',
    // BASE_USERS lives inside an IIFE: fall back to reading the array literal from the page source.
    sourceArray: 'BASE_USERS',
  },
];

const report = {};
for (const j of JOBS) {
  await page.goto(`${O}/${j.url}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  let data;
  if (j.sourceArray) {
    // read the literal straight from the source file (the array lives inside an IIFE in the page)
    const src = fs.readFileSync('C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/design/prototype-copy/' + j.url, 'utf8');
    const re = new RegExp(String.raw`(?:const|let|var)\s+${j.sourceArray}\s*=\s*(\[[\s\S]*?
\s*\]);`);
    const m = src.match(re);
    data = m ? eval(m[1]) : null;
  } else {
    data = await page.evaluate(j.expr);
  }
  if (!data || !Array.isArray(data) || !data.length) {
    report[j.file] = { ok: false, reason: 'array not global in page scope', probed: true };
    console.log(j.file, 'MISS');
    continue;
  }
  fs.writeFileSync(`${OUT}/${j.file}`, JSON.stringify(data, null, 2) + '\n');
  report[j.file] = { ok: true, items: data.length, keys: Object.keys(data[0]), bytes: fs.statSync(`${OUT}/${j.file}`).size };
  console.log(j.file, 'ok items=' + data.length, JSON.stringify(Object.keys(data[0])));
}
fs.mkdirSync('C:/Users/alghi/AppData/Local/Temp/p3', { recursive: true });
fs.writeFileSync('C:/Users/alghi/AppData/Local/Temp/p3/fixtures.json', JSON.stringify(report, null, 1));
await browser.close();