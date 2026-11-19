// P02 control discovery - list the actually visible controls for the states that failed
import { chromium } from 'playwright';
const O = 'http://127.0.0.1:8099/prototype-copy';
const browser = await chromium.launch();
const CASES = [
  ['penerbit/kelola_buku_desktop.html', 1440, ['[aria-label^="Aksi"]', '#book-rows tr button', 'menu button', '[role="menuitem"]']],
  ['penerbit/pesanan_masuk_desktop.html', 1440, ['#order-rows tr button', '#order-rows tr a', '[aria-label*="etail"]']],
  ['penerbit/pendapatan_dan_pencairan_desktop.html', 1440, ['button', 'input', 'select']],
  ['penerbit/pengaturan_profil_desktop.html', 1440, ['#btn-bank-edit', '#btn-bank-add', 'button']],
  ['user/keranjang_pembayaran_terpadu_desktop.html', 1440, ['button']],
  ['user/onboarding_preferensi_bacaan_desktop.html', 1440, ['button', '[data-next]', '[data-step]']],
  ['user/riwayat_pesanan_desktop.html', 1440, ['button', 'a[href*="reader"]']],
  ['user/katalog_buku_desktop.html', 1440, ['input', 'button', 'select']],
  ['user/riwayat_ulasan_desktop.html', 1440, ['button']],
  ['user/perpustakaan_saya_desktop.html', 1440, ['button', '[role="tab"]']],
  ['user/katalog_buku_desktop.html', 390, ['button', '[aria-label*="enu"]', '[aria-expanded]']],
  ['admin/kelola_pengguna_desktop.html', 390, ['button', '[aria-label*="enu"]']],
  ['admin/kelola_pencairan_dana_desktop.html', 1440, ['#payout-rows tr button', '[aria-label*="etail"]', 'button']],
];
for (const [page_, w, sels] of CASES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 100)); });
  await page.goto(`${O}/${page_}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  const found = await page.evaluate((sels) => {
    const out = {};
    for (const s of sels) {
      let els = [];
      try { els = [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null); } catch { }
      out[s] = els.slice(0, 6).map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}[${(e.getAttribute('aria-label') ?? e.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30)}]`);
    }
    return out;
  }, sels);
  console.log(`\n## ${page_} @${w}${errs.length ? '  ERRS=' + JSON.stringify(errs.slice(0, 2)) : ''}`);
  for (const [k, v] of Object.entries(found)) console.log(`   ${k}: ${JSON.stringify(v)}`);
  await ctx.close();
}
await browser.close();