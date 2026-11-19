// P11 runtime audit. Runs the same DOM/console/network/a11y checks against the Blade app and the prototype HTML,
// so a finding that appears on both sides is a baseline defect and a Blade-only finding is a regression.
// Usage: node docs/migration/tools/p11-audit.mjs app|proto
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET = process.argv[2] || 'app';
const BASE = TARGET === 'app' ? (process.env.P11_BASE || 'http://127.0.0.1:8140') : 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, `docs/migration/p11-audit-${TARGET}.json`);

// key, app route, prototype path (relative to /prototype-copy), prototype query, prep action for in-place views
const PAGES = [
  ['beranda', '/', 'user/beranda_desktop.html'],
  ['katalog', '/katalog', 'user/katalog_buku_desktop.html'],
  ['detail_buku', '/buku/antologi-puisi-lembayung', 'user/detail_buku_desktop.html'],
  ['preview_buku', '/buku/antologi-puisi-lembayung/cuplikan', 'user/preview_buku_desktop.html'],
  ['masuk_login', '/masuk', 'user/masuk_login_desktop.html'],
  ['masuk_publisher', '/masuk?role=publisher', 'user/masuk_login_desktop.html?role=publisher'],
  ['daftar_akun', '/daftar', 'user/daftar_akun_register_desktop.html'],
  ['lupa_kata_sandi', '/lupa-kata-sandi', 'user/lupa_kata_sandi_desktop.html'],
  ['verifikasi_email', '/verifikasi-email', 'user/verifikasi_email_desktop.html'],
  ['onboarding', '/onboarding', 'user/onboarding_preferensi_bacaan_desktop.html'],
  ['status_penerbit', '/status-pendaftaran-penerbit', 'user/status_pendaftaran_penerbit_desktop.html'],
  ['akun_profil', '/akun/profil', 'user/akun_saya_profil_dropdown_navigasi_desktop.html'],
  ['pengaturan_akun', '/akun/pengaturan', 'user/pengaturan_akun_desktop.html'],
  ['bantuan', '/akun/bantuan', 'user/bantuan_akun_desktop.html'],
  ['chatbot', '/akun/bantuan/chatbot', 'user/chatbot_bantuan_rekomendasi_desktop.html'],
  ['keranjang', '/keranjang', 'user/keranjang_pembayaran_terpadu_desktop.html'],
  ['riwayat_pesanan', '/akun/pesanan', 'user/riwayat_pesanan_desktop.html'],
  ['perpustakaan', '/akun/perpustakaan', 'user/perpustakaan_saya_desktop.html'],
  ['web_reader', '/akun/perpustakaan/laskar-aksara-pasundan/baca', 'user/web_reader_desktop.html'],
  ['riwayat_ulasan', '/akun/ulasan', 'user/riwayat_ulasan_desktop.html'],
  ['agenda', '/agenda', 'user/agenda_berita_literasi_desktop.html'],
  ['detail_agenda', '/agenda/ev-1', 'user/detail_agenda_desktop.html?id=ev-1'],
  ['komunitas', '/komunitas', 'user/komunitas_literasi_desktop.html'],
  ['komunitas_profil', '/komunitas/community-filologi', 'user/komunitas_literasi_desktop.html?komunitas=community-filologi'],
  ['komunitas_ruang', '/komunitas/community-filologi/diskusi', 'user/komunitas_literasi_desktop.html?komunitas=community-filologi', 'room'],
  ['komunitas_topik', '/komunitas/community-klub-buku/diskusi/TPC-2026-101', 'user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101'],
  ['komunitas_balas', '/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-2026-201', 'user/komunitas_literasi_desktop.html?balas=RPL-2026-201'],
  ['penerbit_dashboard', '/penerbit', 'penerbit/dashboard_penerbit_desktop.html'],
  ['kelola_buku', '/penerbit/buku', 'penerbit/kelola_buku_desktop.html'],
  ['pesanan_masuk', '/penerbit/pesanan', 'penerbit/pesanan_masuk_desktop.html'],
  ['pendapatan', '/penerbit/keuangan', 'penerbit/pendapatan_dan_pencairan_desktop.html'],
  ['ulasan_pembeli', '/penerbit/ulasan', 'penerbit/ulasan_pembeli_desktop.html'],
  ['pengaturan_penerbit', '/penerbit/pengaturan', 'penerbit/pengaturan_profil_desktop.html'],
  ['invoice', '/penerbit/invoice', 'penerbit/invoice_penjualan_pdf_portal_penerbit.html'],
  ['admin_dashboard', '/admin', 'admin/dashboard_administrasi_utama_desktop.html'],
  ['kelola_pengguna', '/admin/pengguna', 'admin/kelola_pengguna_desktop.html'],
  ['pengawasan_katalog', '/admin/katalog', 'admin/pengawasan_katalog_buku_global_desktop.html'],
  ['moderasi_ulasan', '/admin/moderasi-ulasan', 'admin/moderasi_ulasan_dan_komentar_desktop.html'],
  ['monitoring', '/admin/monitoring', 'admin/monitoring_global_desktop.html'],
  ['pencairan', '/admin/pencairan', 'admin/kelola_pencairan_dana_desktop.html'],
  ['kelola_komunitas', '/admin/komunitas', 'admin/kelola_komunitas_desktop.html'],
  ['moderasi_diskusi', '/admin/moderasi-diskusi', 'admin/moderasi_diskusi_komunitas_desktop.html'],
  ['admin_login', '/admin/masuk', 'admin/login_administrator_desktop.html'],
];

const VIEWPORTS = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '390x844', width: 390, height: 844 },
];

const urlFor = (page) => (TARGET === 'app' ? BASE + page[1] : `${BASE}/${page[2]}`);

const browser = await chromium.launch();
const rows = [];

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, locale: 'id-ID',
      timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce',
    });
    const p = await ctx.newPage();
    const errors = [];
    const bad = [];
    p.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
    const envNoise = [];
    p.on('console', (m) => {
      if (m.type() !== 'error') return;
      const t = m.text();
      // `php artisan serve` is single threaded: keep-alive sockets occasionally close mid-request. Not a page defect.
      if (/ERR_SOCKET_NOT_CONNECTED|ERR_CONNECTION_CLOSED|ERR_CONNECTION_RESET|net::ERR_ABORTED/.test(t)) { envNoise.push(t.slice(0, 60)); return; }
      errors.push('[console] ' + t.slice(0, 140));
    });
    p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().split('/').slice(-1)[0].slice(0, 40)); });

    // `load` can hang: the Google Fonts CDN (baseline defect D6) stalls occasionally, so fonts get a 4s cap.
    let status = 0;
    try {
      status = await p.goto(urlFor(page), { waitUntil: 'domcontentloaded', timeout: 45000 }).then((r) => r.status());
      // Fonts decide icon box widths (Material Symbols) and therefore overflow measurements: retry once if the CDN stalls.
      for (let attempt = 0; attempt < 2; attempt++) {
        await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]));
        const ok = await p.evaluate(() => document.fonts.check('24px "Material Symbols Outlined"') && document.fonts.check('16px "DM Sans"'));
        if (ok) break;
        await p.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      }
      if (page[3] === 'room') { await p.click('#btn-open-room-inline').catch(() => {}); }
      await p.waitForTimeout(400);
      // Overflow depends on layout settling (icon font metrics, off-canvas drawers mid-transition): sample twice.
      const ox1 = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      if (ox1 > 0) await p.waitForTimeout(900);
      else await p.waitForTimeout(120);
      await p.evaluate(() => { window.scrollTo(0, 0); });
    } catch (e) {
      errors.push('nav:' + String(e).slice(0, 80));
    }

    const dom = await p.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      const imgs = [...document.images];
      const noAlt = imgs.filter((i) => !i.hasAttribute('alt')).map((i) => (i.getAttribute('src') || '').slice(-26));
      const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => (i.getAttribute('src') || '(empty)').slice(-28));
      const named = (el) => {
        const lbl = el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') && (document.getElementById(el.getAttribute('aria-labelledby'))?.innerText || '')) || el.innerText || el.value || el.title || '';
        return String(lbl).trim().length > 0 && !/^(i|span)$/i.test(lbl);
      };
      const visible = (el) => (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : el.offsetParent !== null);
      const unnamed = [...document.querySelectorAll('button, a[href], [role="button"]')]
        .filter((el) => visible(el) && !named(el) && !el.querySelector('img[alt]:not([alt=""])'))
        .map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 2).join('.'));
      const h = document.documentElement;
      const html = h.outerHTML;
      const probes = { cdnTailwind: 'cdn.tailwindcss.com', breeze: 'breeze', bladeEcho: '{{', viteDirective: '@vite(' };
      const forbidden = Object.entries(probes).filter(([, s]) => html.includes(s)).map(([k]) => k);
      return {
        dupIds, noAlt, broken, unnamed: unnamed.slice(0, 5), unnamedCount: unnamed.length,
        overflowX: Math.max(0, h.scrollWidth - h.clientWidth), overflowSample2: 0, forbidden,
        ariaCurrent: document.querySelectorAll('[aria-current]').length,
        bodyLen: document.body.innerText.trim().length,
        title: document.title,
        fontsOk: document.fonts.check('16px "DM Sans"') && document.fonts.check('16px Literata'),
      };
    }).catch(() => ({ error: 'evaluate failed' }));

    rows.push({ key: page[0], viewport: vp.label, status, errors, envNoise, bad: [...new Set(bad)], ...dom });
    await ctx.close();
  }
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
const faults = rows.filter((r) => r.errors?.length || r.bad?.length || r.dupIds?.length || r.overflowX > 0 || r.forbidden?.length || r.unnamedCount);
console.log(TARGET, 'rows:', rows.length, 'faults:', faults.length, '->', OUT);
for (const r of faults) console.log('-', r.key, r.viewport, JSON.stringify({ st: r.status, err: r.errors?.slice(0, 1), bad: r.bad?.slice(0, 2), dup: r.dupIds?.slice(0, 3), ox: r.overflowX, f: r.forbidden, un: r.unnamed?.slice(0, 2) }));