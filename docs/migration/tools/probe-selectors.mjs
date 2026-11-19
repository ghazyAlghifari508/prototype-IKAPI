// P02 selector probe - why do some state recipes miss? (visibility, count)
import { chromium } from 'playwright';

const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const CASES = [
  ['admin/dashboard_administrasi_utama_desktop.html', ['#demo-toggle', '#demo-menu', '#demo-menu [data-demo]', '[data-demo]']],
  ['user/komunitas_literasi_desktop.html', ['#sim-normal', '#sim-detail', '#sim-noresults', '#sim-empty', '#btn-new-topic', 'button:has-text("Mode Demo")', '[data-demo]', '.demo-item']],
  ['user/agenda_berita_literasi_desktop.html', ['#btn-state-normal', '#btn-state-nov18', 'button:has-text("Mode Demo")', '[data-demo]', '.event-card', '.article-card', '[data-open-featured]', '[data-open-article]', '[aria-label*="Mode"]']],
  ['user/chatbot_bantuan_rekomendasi_desktop.html', ['#btn-state-rekomendasi', '#btn-state-loading', 'button:has-text("Mode Demo")', '[data-demo]']],
  ['user/riwayat_ulasan_desktop.html', ['#toggle-dropdown-btn', '.edit-star-btn', '.review-edit', '[data-edit-review]', 'button:has-text("Ubah")', 'button:has-text("Hapus")']],
  ['user/pengaturan_akun_desktop.html', ['#modal-change-password', 'button:has-text("Kata Sandi")', 'button:has-text("Ganti")', '[data-open-password]']],
  ['user/onboarding_preferensi_bacaan_desktop.html', ['[data-next]', '#btn-next', '.step-next', 'button:has-text("Lanjut")', 'button:has-text("Selanjutnya")']],
  ['user/web_reader_desktop.html', ['#btn-open-settings', '#theme-btn-dark', '#modal-unlicensed', 'button:has-text("Fullscreen")']],
  ['penerbit/kelola_buku_desktop.html', ['#book-rows tr[data-id]', '#book-rows tr', 'button:has-text("Tambah Buku Baru")']],
  ['penerbit/pendapatan_dan_pencairan_desktop.html', ['button:has-text("Ajukan Pencairan")', '#btn-request-payout', '[data-open-confirm]']],
  ['penerbit/pengaturan_profil_desktop.html', ['#modal-bank-confirm', '[data-open-bank]', 'button:has-text("Rekening")', 'button:has-text("Ubah Rekening")']],
  ['admin/kelola_pengguna_desktop.html', ['tbody tr', 'tbody tr[data-id]', '#user-rows tr', '[data-row]', '#demo-menu [data-demo]']],
  ['admin/pengawasan_katalog_buku_global_desktop.html', ['tbody tr', '.tab-btn', '[data-view]', '#demo-menu [data-demo]']],
  ['admin/moderasi_ulasan_dan_komentar_desktop.html', ['tbody tr', '.review-row', '[data-row]', '#demo-menu [data-demo]']],
  ['user/katalog_buku_desktop.html', ['[aria-label*="enu"]', '#btn-menu', '.hamburger', '[data-mobile-nav-toggle]', 'button[aria-controls]']],
];

const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const [p, sels] of CASES) {
    await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(200);
    const out = [];
    for (const s of sels) {
      const loc = page.locator(s);
      let n = 0; try { n = await loc.count(); } catch { }
      let vis = false;
      if (n) { try { vis = await loc.first().isVisible(); } catch { } }
      const hiddenAnc = n ? await loc.first().evaluate((el) => {
        let a = el, chain = [];
        while (a && a !== document.body) { const s = getComputedStyle(a); if (s.display === 'none' || s.visibility === 'hidden' || a.classList.contains('hidden')) chain.push(a.id || a.tagName.toLowerCase()); a = a.parentElement; }
        return chain.slice(0, 3);
      }).catch(() => []) : [];
      out.push(`${s}[n=${n}${vis ? ',visible' : n ? ',hidden' : ''}${hiddenAnc.length ? ',in:' + hiddenAnc.join('<') : ''}]`);
    }
    console.log(`w${width} ${p.split('/').pop().slice(0, 34)} :: ${out.join(' ')}`);
  }
  await ctx.close();
}
await browser.close();