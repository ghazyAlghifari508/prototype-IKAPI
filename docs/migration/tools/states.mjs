// P02 baseline capture - interaction states  (v2)
// Run from repo root: node docs/migration/tools/states.mjs   (requires the same static server)
//
// Recipes use three primitives:
//   js        - evaluate a snippet in page context (can call the page's own globals)
//   click     - Playwright click on the first visible candidate selector
//   domClick  - element.click() inside the page (works for controls inside collapsed panels)
//   chips     - enumerate a control group and screenshot the state produced by each item
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const ARGS = process.argv.slice(2);
const ONLY = (ARGS.find((a) => a.startsWith('--only=')) ?? '').replace('--only=', '').split(',').filter(Boolean);
const FULL = ARGS.includes('--full');
const TAGGED = ARGS.includes('--tag');
const MANIFEST = path.join(ROOT, ARGS.find((a) => a.startsWith('--manifest='))?.replace('--manifest=', '') ?? 'states-manifest.json');
const V = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const demoMenu = (page) => ({ key: `${page}#demo-menu`, page, js: [`document.querySelector('#demo-toggle').click()`], chips: '#demo-menu [data-demo], #demo-menu [data-demo-state]' });
const simPanel = (page) => ({ key: `${page}#sim-panel`, page, js: [`document.querySelector('#qa-simulation-panel summary').click()`], chips: '#qa-simulation-panel button[id]' });
const chipsBy = (page, sel, key) => ({ key: `${page}#${key}`, page, chips: sel, groupOpen: true });

const PORTAL_MENUS = [
  'penerbit/dashboard_penerbit_desktop.html', 'penerbit/kelola_buku_desktop.html', 'penerbit/pesanan_masuk_desktop.html',
  'penerbit/pendapatan_dan_pencairan_desktop.html', 'penerbit/ulasan_pembeli_desktop.html', 'penerbit/pengaturan_profil_desktop.html',
  'admin/dashboard_administrasi_utama_desktop.html', 'admin/kelola_pengguna_desktop.html',
  'admin/pengawasan_katalog_buku_global_desktop.html', 'admin/moderasi_ulasan_dan_komentar_desktop.html',
  'admin/monitoring_global_desktop.html', 'admin/kelola_pencairan_dana_desktop.html', 'admin/kelola_komunitas_desktop.html',
  'admin/moderasi_diskusi_komunitas_desktop.html',
];

export const RECIPES = [
  // ---------- auth demo ----------
  { key: 'login#default', page: 'user/masuk_login_desktop.html' },
  { key: 'login#publisher-tab', page: 'user/masuk_login_desktop.html', js: [`document.querySelector('#tab-publisher').click()`] },
  { key: 'login#validation', page: 'user/masuk_login_desktop.html', js: [`document.querySelector('#submit-btn').click()`] },
  { key: 'login#loading', page: 'user/masuk_login_desktop.html', js: [`document.querySelector('.demo-chip[data-demo="loading"]').click()`, `document.querySelector('#submit-btn').click()`] },
  chipsBy('user/masuk_login_desktop.html', '.demo-chip[data-demo]', 'chips'),
  { key: 'register#buyer', page: 'user/daftar_akun_register_desktop.html' },
  { key: 'register#publisher-1', page: 'user/daftar_akun_register_desktop.html', js: [`document.querySelector('#tab-publisher').click()`] },
  { key: 'register#publisher-2', page: 'user/daftar_akun_register_desktop.html', js: [`document.querySelector('#tab-publisher').click()`, `document.querySelector('#pub-next').click()`] },
  { key: 'register#publisher-3', page: 'user/daftar_akun_register_desktop.html', js: [`document.querySelector('#tab-publisher').click()`, `document.querySelector('#pub-next').click()`, `document.querySelector('#pub-next').click()`] },
  chipsBy('user/daftar_akun_register_desktop.html', '.demo-chip[data-demo]', 'chips'),
  { key: 'forgot#default', page: 'user/lupa_kata_sandi_desktop.html' },
  { key: 'forgot#sent', page: 'user/lupa_kata_sandi_desktop.html', js: [`document.querySelector('form button[type="submit"], form button').click()`] },
  { key: 'verify#default', page: 'user/verifikasi_email_desktop.html' },
  { key: 'verify#email-param', page: 'user/verifikasi_email_desktop.html', url: '?email=nama%40contoh.id' },
  { key: 'status#pending', page: 'user/status_pendaftaran_penerbit_desktop.html' },
  { key: 'status#blocked', page: 'user/status_pendaftaran_penerbit_desktop.html', url: '?akses=blokir' },
  { key: 'status#session', page: 'user/status_pendaftaran_penerbit_desktop.html', url: '?sesi=aktif' },
  { key: 'status#demo-ok', page: 'user/status_pendaftaran_penerbit_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('[data-state]')].find((x) => /disetujui|approved/i.test(x.textContent)); if (b) b.click(); })()`] },
  { key: 'status#demo-rejected', page: 'user/status_pendaftaran_penerbit_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('[data-state]')].find((x) => /ditolak|rejected/i.test(x.textContent)); if (b) b.click(); })()`] },

  // ---------- buyer core ----------
  { key: 'home#default', page: 'user/beranda_desktop.html' },
  { key: 'catalog#default', page: 'user/katalog_buku_desktop.html' },
  { key: 'catalog#category-filter', page: 'user/katalog_buku_desktop.html', js: [`(() => { const i = document.querySelector('input[id^="cat-"]:not(#cat-all)'); if (i) { i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); } })()`] },
  { key: 'catalog#no-results', page: 'user/katalog_buku_desktop.html', js: [`(() => { const i = document.querySelector('#catalog-search-input'); if (i) { i.value = 'zzzznotfound'; i.dispatchEvent(new Event('input', { bubbles: true })); } })()`] },
  { key: 'catalog#list-view', page: 'user/katalog_buku_desktop.html', js: [`document.querySelector('#btn-view-list').click()`] },
  { key: 'catalog#sort-last-option', page: 'user/katalog_buku_desktop.html', js: [`(() => { const s = document.querySelector('#catalog-sort-select'); if (s) { s.selectedIndex = s.options.length - 1; s.dispatchEvent(new Event('change', { bubbles: true })); } })()`] },
  { key: 'detail#default', page: 'user/detail_buku_desktop.html' },
  { key: 'detail#book-report', page: 'user/detail_buku_desktop.html', js: [`document.querySelector('#btn-report-book').click()`] },
  { key: 'detail#book-report-filled', page: 'user/detail_buku_desktop.html', js: [`document.querySelector('#btn-report-book').click()`, `(() => { const r = document.querySelector('#book-report-modal input[type="radio"], #book-report-modal .reason-option'); if (r) r.click(); })()`] },
  { key: 'detail#rating-validation', page: 'user/detail_buku_desktop.html', js: [`document.querySelector('#btn-submit-rating').click()`] },
  { key: 'detail#rating-filled', page: 'user/detail_buku_desktop.html', js: [`(() => { const s = document.querySelectorAll('#section-rating [data-star], #section-rating .star'); if (s.length) s[Math.min(4, s.length - 1)].click(); })()`] },
  { key: 'detail#comment-menu', page: 'user/detail_buku_desktop.html', js: [`(() => { const b = document.querySelector('[aria-label*="Laporkan"], .comment-menu-trigger, .btn-comment-menu'); if (b) b.click(); })()`] },
  { key: 'preview#default', page: 'user/preview_buku_desktop.html' },
  { key: 'reader#default', page: 'user/web_reader_desktop.html' },
  { key: 'reader#settings', page: 'user/web_reader_desktop.html', js: [`document.querySelector('#btn-open-settings').click()`] },
  { key: 'reader#theme-dark', page: 'user/web_reader_desktop.html', js: [`document.querySelector('#btn-open-settings').click()`, `document.querySelector('#theme-btn-dark').click()`] },
  { key: 'reader#toc', page: 'user/web_reader_desktop.html', js: [`document.querySelector('#btn-open-toc').click()`] },
  { key: 'reader#bookmarks', page: 'user/web_reader_desktop.html', js: [`document.querySelector('#btn-open-bookmarks').click()`] },
  { key: 'reader#unlicensed', page: 'user/web_reader_desktop.html', js: [`(() => { const m = document.querySelector('#modal-unlicensed'); if (m) m.classList.remove('hidden'); })()`] },
  { key: 'cart#filled', page: 'user/keranjang_pembayaran_terpadu_desktop.html' },
  { key: 'cart#empty', page: 'user/keranjang_pembayaran_terpadu_desktop.html', js: [`(() => { document.querySelectorAll('button').forEach((b) => { if (/Hapus dari Keranjang/i.test(b.getAttribute('aria-label') ?? '')) b.click(); }); })()`] },
  { key: 'cart#snap', page: 'user/keranjang_pembayaran_terpadu_desktop.html', js: [`document.querySelector('#btn-checkout').click()`] },
  { key: 'cart#order-details', page: 'user/keranjang_pembayaran_terpadu_desktop.html', js: [`document.querySelector('#btn-toggle-order-details').click()`] },
  ...['berhasil', 'menunggu', 'gagal', 'kedaluwarsa'].map((s) => ({ key: `cart#status-${s}`, page: 'user/keranjang_pembayaran_terpadu_desktop.html', js: [`(() => { if (typeof setDemoPaymentStatus === 'function') setDemoPaymentStatus('${s}'); })()`] })),
  { key: 'orders#default', page: 'user/riwayat_pesanan_desktop.html' },
  { key: 'orders#tab-pending', page: 'user/riwayat_pesanan_desktop.html', js: [`document.querySelector('#tab-filter-pending').click()`] },
  { key: 'orders#tab-failed', page: 'user/riwayat_pesanan_desktop.html', js: [`document.querySelector('#tab-filter-failed').click()`] },
  { key: 'orders#tab-expired', page: 'user/riwayat_pesanan_desktop.html', js: [`document.querySelector('#tab-filter-expired').click()`] },
  { key: 'library#default', page: 'user/perpustakaan_saya_desktop.html' },
  { key: 'library#tab-reading', page: 'user/perpustakaan_saya_desktop.html', url: '?tab=reading' },
  { key: 'library#tab-unread', page: 'user/perpustakaan_saya_desktop.html', url: '?tab=unread' },
  { key: 'library#tab-favorite', page: 'user/perpustakaan_saya_desktop.html', url: '?tab=favorite' },
  { key: 'library#sim-empty', page: 'user/perpustakaan_saya_desktop.html', js: [`document.querySelector('#btnSimulateEmpty').click()`] },
  { key: 'library#sim-noresults', page: 'user/perpustakaan_saya_desktop.html', js: [`document.querySelector('#btnSimulateNoSearch').click()`] },
  { key: 'reviews#default', page: 'user/riwayat_ulasan_desktop.html' },
  { key: 'reviews#edit-modal', page: 'user/riwayat_ulasan_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Edit/i.test(x.textContent) && x.offsetParent !== null); b.click(); })()`] },
  { key: 'reviews#delete-modal', page: 'user/riwayat_ulasan_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Hapus/i.test(x.textContent) && x.offsetParent !== null); b.click(); })()`] },
  { key: 'profile#default', page: 'user/akun_saya_profil_dropdown_navigasi_desktop.html' },
  { key: 'profile#dropdown', page: 'user/akun_saya_profil_dropdown_navigasi_desktop.html', js: [`(() => { const b = document.querySelector('#profile-dropdown-btn, [aria-haspopup="true"]'); if (b) b.click(); })()`] },
  { key: 'settings#default', page: 'user/pengaturan_akun_desktop.html' },
  { key: 'settings#password-modal', page: 'user/pengaturan_akun_desktop.html', js: [`(() => { if (typeof openPasswordModal === 'function') openPasswordModal(); })()`] },
  { key: 'settings#dropdown', page: 'user/pengaturan_akun_desktop.html', js: [`(() => { const b = document.querySelector('#toggle-dropdown-btn'); if (b) b.click(); })()`] },
  { key: 'help#default', page: 'user/bantuan_akun_desktop.html' },
  { key: 'help#faq-open', page: 'user/bantuan_akun_desktop.html', js: [`(() => { const b = document.querySelector('details summary, .faq-item button, .faq-question'); if (b) b.click(); })()`] },
  { key: 'onboarding#step1', page: 'user/onboarding_preferensi_bacaan_desktop.html' },
  { key: 'onboarding#step2', page: 'user/onboarding_preferensi_bacaan_desktop.html', js: [`(() => { const c = [...document.querySelectorAll('button')].find((x) => /Sastra/i.test(x.textContent)); if (c) c.click(); document.querySelector('[data-next]').click(); })()`] },
  { key: 'onboarding#step3', page: 'user/onboarding_preferensi_bacaan_desktop.html', js: [`(() => { const c = [...document.querySelectorAll('button')].find((x) => /Sastra/i.test(x.textContent)); if (c) c.click(); document.querySelector('[data-next]').click(); })()`, `(() => { const c = [...document.querySelectorAll('button')].find((x) => /Santai|Ringkas|Mendalam|Praktis/i.test(x.textContent)); if (c) c.click(); document.querySelector('[data-next]').click(); })()`] },
  { key: 'onboarding#step4', page: 'user/onboarding_preferensi_bacaan_desktop.html', js: [`(() => { const c = [...document.querySelectorAll('button')].find((x) => /Sastra/i.test(x.textContent)); if (c) c.click(); document.querySelector('[data-next]').click(); })()`, `(() => { const c = [...document.querySelectorAll('button')].find((x) => /Santai|Ringkas|Mendalam|Praktis/i.test(x.textContent)); if (c) c.click(); document.querySelector('[data-next]').click(); })()`, `document.querySelector('[data-next]').click()`] },

  // ---------- agenda + chatbot ----------
  simPanel('user/agenda_berita_literasi_desktop.html'),
  simPanel('user/chatbot_bantuan_rekomendasi_desktop.html'),
  { key: 'agenda#default', page: 'user/agenda_berita_literasi_desktop.html' },
  { key: 'agenda#featured-modal', page: 'user/agenda_berita_literasi_desktop.html', js: [`document.querySelector('.event-card').click()`] },
  { key: 'agenda#article-modal', page: 'user/agenda_berita_literasi_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /Baca|Selengkapnya|artikel/i.test(x.textContent + (x.getAttribute('aria-label') ?? ''))); if (b) b.click(); })()`] },
  { key: 'detail-agenda#valid', page: 'user/detail_agenda_desktop.html', url: '?id=ev-1' },
  { key: 'detail-agenda#invalid', page: 'user/detail_agenda_desktop.html', url: '?id=tidak-ada' },
  { key: 'chatbot-page#default', page: 'user/chatbot_bantuan_rekomendasi_desktop.html' },
  { key: 'chatbot-page#closed', page: 'user/chatbot_bantuan_rekomendasi_desktop.html', js: [`(() => { const b = document.querySelector('#btn-state-toggle'); if (b) b.click(); })()`] },

  // ---------- community ----------
  { key: 'community#explore', page: 'user/komunitas_literasi_desktop.html' },
  simPanel('user/komunitas_literasi_desktop.html'),
  { key: 'community#profile', page: 'user/komunitas_literasi_desktop.html', url: '?komunitas=community-filologi' },
  { key: 'community#room', page: 'user/komunitas_literasi_desktop.html', url: '?topik=TPC-2026-101' },
  { key: 'community#invalid-community', page: 'user/komunitas_literasi_desktop.html', url: '?komunitas=tidak-ada' },
  { key: 'community#invalid-topic', page: 'user/komunitas_literasi_desktop.html', url: '?topik=TPC-TIDAK-ADA' },
  { key: 'community#composer', page: 'user/komunitas_literasi_desktop.html', js: [`(() => { const s = document.querySelector('#sim-detail'); if (s) s.click(); const b = document.querySelector('#btn-new-topic'); if (b) b.click(); })()`] },

  // ---------- portal demo menus + drawers ----------
  ...PORTAL_MENUS.map(demoMenu),
  { key: 'penerbit-books#row-menu', page: 'penerbit/kelola_buku_desktop.html', js: [`document.querySelector('[aria-label^="Aksi"]').click()`] },
  { key: 'penerbit-books#detail', page: 'penerbit/kelola_buku_desktop.html', js: [`document.querySelector('[aria-label^="Aksi"]').click()`, `(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /Detail/i.test(x.textContent) && x.offsetParent !== null); if (b) b.click(); })()`] },
  { key: 'penerbit-books#add-form', page: 'penerbit/kelola_buku_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Tambah Buku Baru/i.test(x.textContent)); b.click(); })()`] },
  { key: 'penerbit-orders#detail', page: 'penerbit/pesanan_masuk_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('#order-rows button')].find((x) => /Detail/i.test(x.textContent)); b.click(); })()`] },
  { key: 'penerbit-payouts#confirm', page: 'penerbit/pendapatan_dan_pencairan_desktop.html', js: [`document.querySelector('#btn-review').click()`] },
  { key: 'penerbit-payouts#detail', page: 'penerbit/pendapatan_dan_pencairan_desktop.html', js: [`document.querySelector('[aria-label^="Lihat detail pengajuan"]').click()`] },
  { key: 'penerbit-reviews#reply', page: 'penerbit/ulasan_pembeli_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Balas/i.test(x.textContent) && x.offsetParent !== null); if (b) b.click(); })()`] },
  { key: 'penerbit-settings#bank-edit', page: 'penerbit/pengaturan_profil_desktop.html', js: [`document.querySelector('#btn-bank-edit').click()`] },
  { key: 'penerbit-settings#bank-confirm', page: 'penerbit/pengaturan_profil_desktop.html', js: [`document.querySelector('#btn-bank-edit').click()`, `(() => { const b = document.querySelector('#btn-bank-review'); if (b && b.offsetParent !== null) b.click(); })()`] },
  { key: 'penerbit-invoice#default', page: 'penerbit/invoice_penjualan_pdf_portal_penerbit.html' },
  { key: 'admin-users#drawer', page: 'admin/kelola_pengguna_desktop.html', js: [`(() => { const b = document.querySelector('#user-rows tr button'); if (b) b.click(); })()`] },
  { key: 'admin-users#approve', page: 'admin/kelola_pengguna_desktop.html', js: [`(() => { const r = document.querySelector('#user-rows tr button'); if (r) r.click(); const b = [...document.querySelectorAll('button')].find((x) => /Setujui/i.test(x.textContent)); if (b) b.click(); })()`] },
  { key: 'admin-users#reject', page: 'admin/kelola_pengguna_desktop.html', js: [`(() => { const r = document.querySelector('#user-rows tr button'); if (r) r.click(); const b = [...document.querySelectorAll('button')].find((x) => /Tolak/i.test(x.textContent)); if (b) b.click(); })()`] },
  { key: 'admin-catalog#reports', page: 'admin/pengawasan_katalog_buku_global_desktop.html', js: [`(() => { if (typeof openReports === 'function') openReports(); })()`] },
  { key: 'admin-catalog#catalog', page: 'admin/pengawasan_katalog_buku_global_desktop.html', js: [`(() => { const t = document.querySelectorAll('.tab-btn'); if (t[1]) t[1].click(); })()`] },
  { key: 'admin-catalog#drawer', page: 'admin/pengawasan_katalog_buku_global_desktop.html', js: [`(() => { const b = document.querySelector('#report-rows tr button, #catalog-rows tr button'); if (b) b.click(); })()`] },
  { key: 'admin-review#drawer', page: 'admin/moderasi_ulasan_dan_komentar_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Tinjau|Periksa|Detail/i.test(x.textContent)); if (b) b.click(); })()`] },
  { key: 'admin-monitoring#reset-filter', page: 'admin/monitoring_global_desktop.html', js: [`(() => { const b = document.querySelector('#btn-reset-empty'); if (b) b.click(); })()`] },
  { key: 'admin-payouts#drawer', page: 'admin/kelola_pencairan_dana_desktop.html', js: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Periksa/i.test(x.textContent) && x.offsetParent !== null); if (b) b.click(); })()`] },
  { key: 'admin-community#drawer', page: 'admin/kelola_komunitas_desktop.html', js: [`(() => { const b = document.querySelector('#community-rows tr button'); if (b) b.click(); })()`] },
  { key: 'admin-community#create', page: 'admin/kelola_komunitas_desktop.html', js: [`(() => { if (typeof startCreate === 'function') startCreate(); })()`] },
  { key: 'admin-discussion#seed', page: 'admin/moderasi_diskusi_komunitas_desktop.html', js: [`document.querySelector('#demo-toggle').click()`, `(() => { const c = [...document.querySelectorAll('#demo-menu [data-demo]')].find((x) => /seed/i.test(x.getAttribute('data-demo'))); if (c) c.click(); })()`] },
  { key: 'admin-discussion#drawer', page: 'admin/moderasi_diskusi_komunitas_desktop.html', js: [`document.querySelector('#demo-toggle').click()`, `(() => { const c = [...document.querySelectorAll('#demo-menu [data-demo]')].find((x) => /seed/i.test(x.getAttribute('data-demo'))); if (c) c.click(); })()`, `(() => { const b = document.querySelector('#report-rows tr button'); if (b) b.click(); })()`] },
  { key: 'admin-login#default', page: 'admin/login_administrator_desktop.html' },
  { key: 'admin-login#blocked', page: 'admin/login_administrator_desktop.html', url: '?akses=blokir' },

  // ---------- responsive (390x844) ----------
  ...['penerbit/dashboard_penerbit_desktop.html', 'penerbit/kelola_buku_desktop.html',
      'admin/dashboard_administrasi_utama_desktop.html', 'admin/kelola_pengguna_desktop.html',
      'admin/pengawasan_katalog_buku_global_desktop.html'].map((p) => ({
    key: `${p}#mobile-sidebar`, page: p, viewport: 'mobile',
    js: [`document.querySelector('#sidebar-toggle').click()`],
  })),
  { key: 'user/katalog_buku_desktop.html#mobile-nav-scroll', page: 'user/katalog_buku_desktop.html', viewport: 'mobile',
    js: [`(() => { const n = document.querySelector('nav[class*="overflow-x-auto"]'); if (n) n.scrollLeft = 140; })()`] },
];

// ---------- runner ----------
if (fs.existsSync(MANIFEST) && !TAGGED) fs.rmSync(MANIFEST);
const manifest = [];
const browser = await chromium.launch();
// Fresh context per recipe: demo pages persist sessions/state in localStorage, and the portal
// guards redirect when a buyer session (or a pending publisher application) is present.
const ctxFor = async (name) => browser.newContext({
  viewport: V[name] ?? V.desktop, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta',
  colorScheme: 'light', reducedMotion: 'reduce',
});

const shoot = async (page, file) => { await page.screenshot({ path: file, fullPage: FULL }); return fs.statSync(file).size; };

const RUN = ONLY.length ? RECIPES.filter((r) => ONLY.includes(r.key)) : RECIPES;
for (const r of RUN) {
  const ctx = await ctxFor(r.viewport ?? 'desktop');
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  const dir = path.join(ROOT, path.dirname(r.page), path.basename(r.page, '.html'));
  fs.mkdirSync(dir, { recursive: true });
  const entry = { key: r.key, page: r.page, viewport: r.viewport ?? 'desktop', screens: [] };

  try {
    await page.goto(`${ORIGIN}/${r.page}${r.url ?? ''}`, { waitUntil: 'load', timeout: 45000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(300);
    for (const js of r.js ?? []) { await page.evaluate(js); await page.waitForTimeout(400); }

    if (r.chips) {
      if (r.groupOpen) await page.evaluate(`(() => { const t = document.querySelector('#demo-toggle, #qa-simulation-panel summary'); if (t && t.getAttribute && t.getAttribute('aria-expanded') === 'false') t.click(); })()`);
      else await page.evaluate(`(() => { const t = document.querySelector('#demo-toggle, #qa-simulation-panel summary'); if (t) { const d = document.querySelector('#demo-menu, #qa-simulation-panel'); if (d && d.classList.contains('hidden')) t.click(); } })()`);
      await page.waitForTimeout(300);
      const ids = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map((e, i) => ({ i, id: e.id || null, value: e.getAttribute('data-demo') ?? e.getAttribute('data-demo-state'), text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) })), r.chips);
      entry.chipCount = ids.length;
      for (const c of ids) {
        if (r.groupOpen) await page.evaluate(`(() => { const t = document.querySelector('#demo-toggle, #qa-simulation-panel summary'); if (t) { const open = document.querySelector('#demo-menu') ? !document.querySelector('#demo-menu').classList.contains('hidden') : document.querySelector('#qa-simulation-panel').open; if (!open) t.click(); } })()`);
        const clicked = await page.evaluate(({ sel, i }) => { const els = [...document.querySelectorAll(sel)]; if (!els[i]) return false; els[i].click(); return true; }, { sel: r.chips, i: c.i });
        await page.waitForTimeout(400);
        const name = String(c.value ?? c.text ?? c.i).replace(/[^a-z0-9-]/gi, '_').toLowerCase();
        const file = path.join(dir, `state-${name}${FULL ? '-full' : ''}.png`);
        const bytes = await shoot(page, file);
        entry.screens.push({ state: name, label: c.text, clicked, file: path.relative(ROOT, file).replace(/\\/g, '/'), bytes });
      }
    } else {
      const name = r.key.split('#')[1].replace(/[^a-z0-9-]/gi, '_').toLowerCase();
      const file = path.join(dir, `state-${name}${FULL ? '-full' : ''}.png`);
      const bytes = await shoot(page, file);
      entry.screens.push({ state: name, file: path.relative(ROOT, file).replace(/\\/g, '/'), bytes });
    }
    entry.errors = errors;
  } catch (e) {
    entry.error = String(e).slice(0, 300);
  } finally {
    entry.finalUrl = (() => { try { return page.url(); } catch { return null; } })();
    await page.close();
    await ctx.close();
  }
  manifest.push(entry);
  if (TAGGED) {
    const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
    fs.writeFileSync(MANIFEST, JSON.stringify([...prev.filter((m) => !manifest.some((x) => x.key === m.key)), ...manifest], null, 1));
  } else {
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
  }
  console.log(`${r.key} ${entry.error ? 'ERR ' + entry.error.slice(0, 60) : 'ok'} screens=${entry.screens.length}`);
}
await browser.close();
console.log('STATES DONE', manifest.length);