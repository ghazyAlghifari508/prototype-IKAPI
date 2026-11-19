// P02 DOM probe: where do admin/penerbit rows actually live at default state?
import { chromium } from 'playwright';
const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const PAGES = [
  'admin/kelola_pengguna_desktop.html', 'admin/pengawasan_katalog_buku_global_desktop.html',
  'admin/moderasi_ulasan_dan_komentar_desktop.html', 'admin/kelola_pencairan_dana_desktop.html',
  'admin/kelola_komunitas_desktop.html', 'admin/moderasi_diskusi_komunitas_desktop.html',
  'admin/monitoring_global_desktop.html', 'admin/dashboard_administrasi_utama_desktop.html',
  'penerbit/kelola_buku_desktop.html', 'penerbit/pesanan_masuk_desktop.html',
];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();
for (const p of PAGES) {
  await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    tbodies: [...document.querySelectorAll('tbody')].map((t) => ({ id: t.id, rows: t.children.length, firstRowId: t.children[0]?.getAttribute?.('data-id') ?? null })),
    visibleRows: [...document.querySelectorAll('tr[data-id]')].filter((r) => r.offsetParent !== null).length,
    clickableRows: [...document.querySelectorAll('[data-id]')].filter((r) => r.offsetParent !== null).slice(0, 3).map((r) => `${r.tagName.toLowerCase()}#${r.id || ''}.${r.className.toString().slice(0, 24)}`),
    tableDisplays: [...document.querySelectorAll('table')].map((t) => getComputedStyle(t.closest('[id]') ?? t).display).slice(0, 4),
    viewIds: [...document.querySelectorAll('[id^="view-"]')].map((e) => `${e.id}:${e.offsetParent !== null ? 'visible' : 'hidden'}`),
  }));
  console.log(p.split('/').pop().slice(0, 40), JSON.stringify(info));
}
await browser.close();