import { chromium } from 'playwright';
const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();
const P = ['admin/kelola_pengguna_desktop.html','admin/kelola_pencairan_dana_desktop.html','admin/kelola_komunitas_desktop.html','admin/moderasi_ulasan_dan_komentar_desktop.html','admin/moderasi_diskusi_komunitas_desktop.html','admin/monitoring_global_desktop.html','admin/pengawasan_katalog_buku_global_desktop.html','penerbit/pesanan_masuk_desktop.html','penerbit/pendapatan_dan_pencairan_desktop.html'];
for (const p of P) {
  await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-id]')];
    const tbody = document.querySelector('tbody');
    const listCandidates = [...document.querySelectorAll('[id$="-rows"], [id$="-list"], [id$="-queue"], [id$="-items"]')];
    return {
      dataIdCount: ids.length, dataIdVisible: ids.filter((e) => e.offsetParent !== null).length,
      dataIdSample: ids.slice(0, 3).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('data-id')}]`),
      tbodyId: tbody?.id ?? null, tbodyRows: tbody?.children.length ?? 0, tbodyText: (tbody?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 90),
      containers: listCandidates.map((c) => `${c.id}:${c.children.length}:${c.offsetParent !== null ? 'vis' : 'hid'}`),
      clickableOpeners: [...document.querySelectorAll('button,a')].filter((b) => b.offsetParent !== null && /detail|tinjau|lihat|review|drawer/i.test(b.getAttribute('aria-label') ?? '')).slice(0, 3).map((b) => (b.getAttribute('aria-label') ?? '').slice(0, 40)),
    };
  });
  console.log(p.split('/').pop().slice(0, 36), JSON.stringify(r).slice(0, 560));
}
await browser.close();
