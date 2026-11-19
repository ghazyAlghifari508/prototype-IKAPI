# P02 - Visual Baseline & Golden Reference Capture

Fase: **baseline pengamatan (read-only)**. HTML prototype tidak diubah satu byte pun; seluruh artefak ada di `docs/migration/`.
Masukan: `docs/migration/p1-inventory.md` + `docs/migration/p1-architecture-blueprint.md`.

## 1. Sumber yang diverifikasi

| Item | Nilai |
|---|---|
| Repository | `ghazyAlghifari508/prototype-IKAPI` |
| Branch / commit | `prototype-only` @ `f243012` (branch `prototype` tetap tidak ada di lokal/remote) |
| Working tree saat capture | hanya `docs/prompts/*` (milik pemilik) + `docs/migration/**` (artefak fase ini) |
| Jumlah halaman kanonis | **38** (2 berkas redirect tidak di-screenshot; lihat P01) |
| Aset | `docs/design/assets` 76 berkas, tidak diubah |

Hash berkas kunci (md5, 12 digit) - untuk mendeteksi drift bila baseline dipertanyakan:

| Berkas | md5 |
|---|---|
| `prototype-copy/user/beranda_desktop.html` | `b1a4b112e714` |
| `prototype-copy/user/katalog_buku_desktop.html` | `bf4b691ca49a` |
| `prototype-copy/user/detail_buku_desktop.html` | `a9e6ac2498a3` |
| `prototype-copy/user/keranjang_pembayaran_terpadu_desktop.html` | `019cce05de93` |
| `prototype-copy/user/komunitas_literasi_desktop.html` | `5776c7a58ad8` |
| `prototype-copy/user/masuk_login_desktop.html` | `84c092a9e21b` |
| `prototype-copy/penerbit/dashboard_penerbit_desktop.html` | `33d777cd843b` |
| `prototype-copy/admin/dashboard_administrasi_utama_desktop.html` | `6a74825523f6` |
| `prototype-copy/user/chatbot-widget.js` | `d68ef063245e` |
| `prototype-copy/admin/admin-guard.js` | `40d56108248f` |
| `prototype-copy/penerbit/access-guard.js` | `917e590fb39e` |

Aset pendukung (md5): `covers/laskar-aksara-pasundan.jpg`=7cd165ec2f62, `logo-ikapi-jabar.png`=648ef6df21c2, `events/event-community.jpg`=493f777e0162, `banner-hero/Dari Penerbit Jawa Barat.png`=5019a155dd9b, `ilustration/hero_reading_book_lover.svg`=aebb62965bab

## 2. Lingkungan pengamatan (dikontrol, satu engine)

| Parameter | Nilai |
|---|---|
| Origin | `http://127.0.0.1:8099` (static server di atas `docs/design/`, bukan `file://`) - relasi `../../assets/...` resolve ke `docs/design/assets/` |
| Engine | Chromium dari Playwright 1.65.1 (`chromium-1255`), headless |
| deviceScaleFactor | 1, zoom 100% |
| Locale / timezone | `id-ID` / `Asia/Jakarta` |
| colorScheme | `light` |
| reducedMotion | `reduce` (menstabilkan transisi/animasi) |
| Viewport | 1440x900, 1366x768, 768x1024, 390x844, 320x700 |
| Kesiapan | `load` -> `document.fonts.ready` -> semua `<img>` selesai (timeout 8s) -> jeda 300ms |
| Isolasi state | **satu konteks browser baru per halaman/state** (wajib: lihat D5) |
| Batas full-page | 12000px; 0 halaman melewatinya (tidak ada yang dipotong) |

Catatan ketergantungan eksternal: 38 halaman memuat **Tailwind via CDN (3.4.17)** + Google Fonts + Material Symbols. Pada run ini **0 request gagal**, `document.fonts.status = "loaded"`, keluarga ikon teresolusi. Screenshot tanpa jaringan tidak valid.

## 3. Manifest & lokasi artefak

- Pola direktori: `docs/migration/baselines/<persona>/<nama-halaman>/`
- Nama berkas: `<viewport>-viewport.png`, `<viewport>-full.png`, `state-<nama>.png`, `state-<nama>-full.png`, `diff-<nama>.png`
- Manifest mesin: `manifest.json` (matriks), `metrics.json` (computed style), `states-manifest.json`, `states-manifest-full.json`, `states-final.json`, `states-final2.json`, `states-verification*.json`, `defects-probe.json`
- Skrip reproduksi: `docs/migration/tools/*.mjs` (lihat bagian 8)
- **Ukuran: 1025 PNG, 166.3 MB** (matriks full-page saja 56.6 MB). Direktori ini belum di-commit; untuk jangka panjang pindahkan ke artifact store eksternal atau Git LFS.

Hasil matriks: **190 capture** (38 halaman x 5 viewport), **0 gagal**, rata-rata 3229 ms per capture.

## 4. Cakupan per halaman

| Halaman | Viewport | Ukuran 1440 (px) | Overflow >1px | Redirect saat load | Placeholder `src=""` | State interaksi terverifikasi | State belum berubah |
|---|---|---|---|---|---|---|---|
| `admin/dashboard_administrasi_utama_desktop.html` | 5/5 | 1440x1028 | - | - | - | 7 (b, c, d, mobile-sidebar, b, c, d) | a |
| `admin/kelola_komunitas_desktop.html` | 5/5 | 1440x900 | - | - | ya | 3 (drawer, reset, create) | - |
| `admin/kelola_pencairan_dana_desktop.html` | 5/5 | 1440x900 | - | - | - | 14 (b, c, e, f, g, h, a, b) | drawer |
| `admin/kelola_pengguna_desktop.html` | 5/5 | 1440x900 | - | - | - | 16 (approve, b, c, d, drawer, e, f, g) | a |
| `admin/login_administrator_desktop.html` | 5/5 | 1440x900 | - | - | - | 2 (blocked, default) | - |
| `admin/moderasi_diskusi_komunitas_desktop.html` | 5/5 | 1440x900 | - | - | - | 3 (clear, drawer, seed) | - |
| `admin/moderasi_ulasan_dan_komentar_desktop.html` | 5/5 | 1440x1222 | - | - | ya | 8 (a, b, c, d, drawer, e, f, g) | - |
| `admin/monitoring_global_desktop.html` | 5/5 | 1440x1646 | - | - | - | 8 (b, c, d, e, b, c, d, e) | a, reset-filter |
| `admin/pengawasan_katalog_buku_global_desktop.html` | 5/5 | 1440x900 | - | - | - | 15 (b, c, catalog, d, drawer, e, f, g) | a, reports |
| `penerbit/dashboard_penerbit_desktop.html` | 5/5 | 1440x1409 | - | - | - | 1 (mobile-sidebar) | - |
| `penerbit/invoice_penjualan_pdf_portal_penerbit.html` | 5/5 | 1440x1268 | 320x700 | - | - | 1 (default) | - |
| `penerbit/kelola_buku_desktop.html` | 5/5 | 1440x942 | - | - | ya | 14 (add-form, detail, draft, empty, loading, mobile-sidebar, noresults, row-menu) | filled |
| `penerbit/pendapatan_dan_pencairan_desktop.html` | 5/5 | 1440x1333 | - | - | - | 18 (b, c, confirm, d, detail, e, f, g) | a |
| `penerbit/pengaturan_profil_desktop.html` | 5/5 | 1440x1187 | - | - | - | 11 (a, b, bank-confirm, c, d, e, f, g) | - |
| `penerbit/pesanan_masuk_desktop.html` | 5/5 | 1440x964 | - | - | - | 11 (b, c, d, detail, e, f, b, c) | a |
| `penerbit/ulasan_pembeli_desktop.html` | 5/5 | 1440x1748 | - | - | - | 13 (b, c, d, e, f, g, reply, b) | a |
| `user/agenda_berita_literasi_desktop.html` | 5/5 | 1440x2676 | - | - | - | 6 (article-modal, mode_berita_kosong, mode_jadwal_kosong, pilih_tgl_18_nov, tampilan_normal, article-modal) | featured-modal |
| `user/akun_saya_profil_dropdown_navigasi_desktop.html` | 5/5 | 1440x1371 | - | - | - | 1 (dropdown) | - |
| `user/bantuan_akun_desktop.html` | 5/5 | 1440x1694 | - | - | - | 1 (faq-open) | - |
| `user/beranda_desktop.html` | 5/5 | 1440x3663 | - | - | - | 0 | - |
| `user/chatbot_bantuan_rekomendasi_desktop.html` | 5/5 | 1440x1249 | - | - | - | 6 (bantuan_pembayaran___reader, closed, layanan_cs___luar_lingkup, rekomendasi_buku, status_memuat___, visibility_tutup_jendela_chat) | - |
| `user/daftar_akun_register_desktop.html` | 5/5 | 1440x917 | - | ya | - | 7 (default, duplicate, loading, publisher-1, publisher-2, publisher-3, success) | buyer |
| `user/detail_agenda_desktop.html` | 5/5 | 1440x1008 | - | - | ya | 1 (valid) | invalid |
| `user/detail_buku_desktop.html` | 5/5 | 1440x3208 | - | - | ya | 3 (book-report, book-report-filled, rating-validation) | comment-menu, rating-filled |
| `user/katalog_buku_desktop.html` | 5/5 | 1440x3338 | - | - | - | 5 (list-view, mobile-nav-scroll, no-results, sort-last-option, category-filter) | - |
| `user/keranjang_pembayaran_terpadu_desktop.html` | 5/5 | 1440x1137 | - | - | - | 7 (empty, snap, status-berhasil, status-berhasil, status-gagal, status-kedaluwarsa, status-menunggu) | filled, order-details |
| `user/komunitas_literasi_desktop.html` | 5/5 | 1440x1509 | - | - | ya | 10 (composer, data_kosong, direktori_normal, invalid-community, invalid-topic, mode_detail_komunitas, nonaktifkan_sesi_pembeli_demo, pencarian_nihil) | explore |
| `user/lupa_kata_sandi_desktop.html` | 5/5 | 1440x900 | - | - | - | 1 (sent) | - |
| `user/masuk_login_desktop.html` | 5/5 | 1440x900 | - | ya | - | 7 (default, invalid, loading, network, pending, publisher-tab, validation) | - |
| `user/onboarding_preferensi_bacaan_desktop.html` | 5/5 | 1440x900 | - | - | - | 3 (step2, step3, step4) | step1 |
| `user/pengaturan_akun_desktop.html` | 5/5 | 1440x1843 | - | - | - | 2 (dropdown, password-modal) | - |
| `user/perpustakaan_saya_desktop.html` | 5/5 | 1440x1673 | - | - | - | 5 (sim-empty, sim-noresults, tab-favorite, tab-reading, tab-unread) | - |
| `user/preview_buku_desktop.html` | 5/5 | 1440x1239 | - | - | - | 0 | - |
| `user/riwayat_pesanan_desktop.html` | 5/5 | 1440x1953 | - | - | - | 3 (tab-expired, tab-failed, tab-pending) | - |
| `user/riwayat_ulasan_desktop.html` | 5/5 | 1440x1293 | 320x700 | - | - | 2 (delete-modal, edit-modal) | - |
| `user/status_pendaftaran_penerbit_desktop.html` | 5/5 | 1440x900 | - | - | - | 2 (blocked, session) | demo-ok, demo-rejected, pending |
| `user/verifikasi_email_desktop.html` | 5/5 | 1440x900 | - | - | - | 1 (email-param) | - |
| `user/web_reader_desktop.html` | 5/5 | 1440x1142 | - | - | - | 5 (bookmarks, settings, theme-dark, toc, unlicensed) | - |

"Redirect saat load" hanya terjadi di `user/masuk_login_desktop.html` dan `user/daftar_akun_register_desktop.html`: halaman menormalkan URL menjadi `?role=buyer`. Ini perilaku final prototype, bukan cacat.

### 4.1 Verifikasi aset, font, ikon, crop & transform

| Pemeriksaan | Hasil terukur |
|---|---|
| Referensi aset rusak (`../../assets/...`) | **0** dari 45 berkas sumber |
| Referensi internal `.html` rusak | **0** |
| Gambar eksternal (`<img src="http...">`) | **0** |
| Data URI / base64 image | **0** |
| `<img>` total | **140**; `<svg>` inline **20** |
| Crop | `object-cover` **81** pemakaian di **22** halaman; `object-contain` **51** |
| Rasio aspek | `aspect-[...]` **46**, `aspect-video/square` **10** |
| Transform & animasi | utilitas transform **230**, `transition-*` **1228**, `animate-*` **70**, `backdrop-blur` **32**, filter grayscale/sepia **0** |
| Font | `document.fonts.status = "loaded"` pada seluruh 190 capture; DM Sans + Material Symbols teresolusi (`"Material Symbols Outlined"`) |
| Aksesibilitas gerak | **21 halaman** memuat `@media (prefers-reduced-motion: reduce)`; capture memakai `reducedMotion=reduce` sehingga baseline tidak bergantung animasi |
| Checksum aset penting | lihat tabel di bagian 1 (`covers/laskar-aksara-pasundan.jpg`, `logo-ikapi-jabar.png`, `events/event-community.jpg`, `banner-hero/Dari Penerbit Jawa Barat.png`, `ilustration/hero_reading_book_lover.svg`) - dihitung dari `docs/design/assets` |

Data fixture per state juga terekam: setiap entri `states-manifest*.json` menyimpan label chip, nilai `data-demo`/`data-demo-state`, kueri URL (`?komunitas=`, `?topik=`, `?balas=`, `?tab=`, `?id=`, `?role=`, `?akses=`, `?sesi=`), serta `finalUrl` dan `storageKeys` tiap capture di `manifest.json`.

## 5. State interaksi

- **131 resep** pada pass viewport (220 screenshot), **47 resep** diulang full-page (97 screenshot) untuk perubahan di bawah fold, plus **25 resep** pass final dengan assert DOM.
- Verifikasi tidak memakai asumsi: setiap state dibandingkan pixel ke golden default halaman pada viewport yang sama (`--threshold=0`), dan bila rasio 0 diulang dengan screenshot full-page serta assert DOM (`before` != `after`).
- Hasil: **179 dari 224 screenshot state LULUS** (berbeda dari default atau terbukti lewat assert DOM); 45 belum berubah dengan penjelasan di bawah.
- Overlay diff per state tersimpan sebagai `diff-<state>.png` di direktori halaman terkait (magenta = piksel berbeda, abu = sama).

### 5.1 State yang lulus (contoh representatif)

| Resep | State | Label | Rasio beda vs default (viewport) | Hasil | Berkas golden | Bytes |
|---|---|---|---|---|---|---|
| `admin-catalog#catalog` | `catalog` | - | 0.0381 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-catalog.png` | 121893 |
| `admin-catalog#drawer` | `drawer` | - | 0.7637 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-drawer.png` | 151099 |
| `admin-community#drawer` | `drawer` | - | 0.6560 | lulus | `admin/kelola_komunitas_desktop/state-drawer.png` | 153628 |
| `admin-discussion#drawer` | `drawer` | - | 0.6469 | lulus | `admin/moderasi_diskusi_komunitas_desktop/state-drawer.png` | 164933 |
| `admin-discussion#seed` | `seed` | - | 0.0339 | lulus | `admin/moderasi_diskusi_komunitas_desktop/state-seed.png` | 128932 |
| `admin-login#blocked` | `blocked` | - | 0.0647 | lulus | `admin/login_administrator_desktop/state-blocked.png` | 593837 |
| `admin-login#default` | `default` | - | 0.0000 | lulus | `admin/login_administrator_desktop/state-default.png` | 584538 |
| `admin-review#drawer` | `drawer` | - | 0.7732 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-drawer.png` | 193960 |
| `admin-users#approve` | `approve` | - | 0.9493 | lulus | `admin/kelola_pengguna_desktop/state-approve.png` | 157292 |
| `admin-users#drawer` | `drawer` | - | 0.7687 | lulus | `admin/kelola_pengguna_desktop/state-drawer.png` | 147531 |
| `admin-users#reject` | `reject` | - | 0.9421 | lulus | `admin/kelola_pengguna_desktop/state-reject.png` | 146189 |
| `admin/dashboard_administrasi_utama_desktop.html#demo-menu` | `b` | Antrean Bersihcheck | 0.0137 | lulus | `admin/dashboard_administrasi_utama_desktop/state-b.png` | 128534 |
| `admin/dashboard_administrasi_utama_desktop.html#demo-menu` | `c` | Data Kosongcheck | 0.0293 | lulus | `admin/dashboard_administrasi_utama_desktop/state-c.png` | 110217 |
| `admin/dashboard_administrasi_utama_desktop.html#demo-menu` | `d` | Gagal Memuatcheck | 0.0411 | lulus | `admin/dashboard_administrasi_utama_desktop/state-d.png` | 84640 |
| `admin/dashboard_administrasi_utama_desktop.html#mobile-sidebar` | `mobile-sidebar` | - | 0.5664 | lulus | `admin/dashboard_administrasi_utama_desktop/state-mobile-sidebar.png` | 47280 |
| `admin/kelola_komunitas_desktop.html#demo-menu` | `reset` | Kembalikan data komunitas awal | 0.0420 | lulus | `admin/kelola_komunitas_desktop/state-reset.png` | 123490 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `a` | Pengajuan Dalam Prosescheck | 0.0000 | lulus | `admin/kelola_pencairan_dana_desktop/state-a.png` | 105510 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `b` | Pengajuan Selesaicheck | 0.0229 | lulus | `admin/kelola_pencairan_dana_desktop/state-b.png` | 115225 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `c` | Pengajuan Ditolakcheck | 0.0181 | lulus | `admin/kelola_pencairan_dana_desktop/state-c.png` | 103999 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `d` | Detail Pencairancheck | 0.0000 | lulus | `admin/kelola_pencairan_dana_desktop/state-d.png` | 105464 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `e` | Bukti Transfer Terkirimcheck | 0.0235 | lulus | `admin/kelola_pencairan_dana_desktop/state-e.png` | 116284 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `f` | Bukti Belum Tersediacheck | 0.0007 | lulus | `admin/kelola_pencairan_dana_desktop/state-f.png` | 106499 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `g` | Konfirmasi Penolakancheck | 0.0007 | lulus | `admin/kelola_pencairan_dana_desktop/state-g.png` | 106538 |
| `admin/kelola_pencairan_dana_desktop.html#demo-menu` | `h` | Konfirmasi Penyelesaiancheck | 0.0008 | lulus | `admin/kelola_pencairan_dana_desktop/state-h.png` | 106566 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `b` | Semua Penggunacheck | 0.0465 | lulus | `admin/kelola_pengguna_desktop/state-b.png` | 132989 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `c` | Detail Penerbitcheck | 0.7663 | lulus | `admin/kelola_pengguna_desktop/state-c.png` | 151964 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `d` | Konfirmasi Persetujuancheck | 0.9493 | lulus | `admin/kelola_pengguna_desktop/state-d.png` | 157292 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `e` | Konfirmasi Penolakancheck | 0.9421 | lulus | `admin/kelola_pengguna_desktop/state-e.png` | 146960 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `f` | Konfirmasi Nonaktifkancheck | 0.9698 | lulus | `admin/kelola_pengguna_desktop/state-f.png` | 153232 |
| `admin/kelola_pengguna_desktop.html#demo-menu` | `g` | Notifikasi Suksescheck | 0.0157 | lulus | `admin/kelola_pengguna_desktop/state-g.png` | 127075 |
| `admin/kelola_pengguna_desktop.html#mobile-sidebar` | `mobile-sidebar` | - | 0.6154 | lulus | `admin/kelola_pengguna_desktop/state-mobile-sidebar.png` | 56907 |
| `admin/moderasi_diskusi_komunitas_desktop.html#demo-menu` | `clear` | Kosongkan laporan demo | 0.0310 | lulus | `admin/moderasi_diskusi_komunitas_desktop/state-clear.png` | 120390 |
| `admin/moderasi_diskusi_komunitas_desktop.html#demo-menu` | `seed` | Muat contoh laporan demo | 0.0339 | lulus | `admin/moderasi_diskusi_komunitas_desktop/state-seed.png` | 128932 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `a` | Laporan Masukcheck | 0.0027 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-a.png` | 137570 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `b` | Semua Ulasancheck | 0.0089 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-b.png` | 137581 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `c` | Detail Moderasicheck | 0.7732 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-c.png` | 192838 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `d` | Konfirmasi Hapuscheck | 0.9583 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-d.png` | 197748 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `e` | Pertahankan Komentarcheck | 0.0543 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-e.png` | 144749 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `f` | Notifikasi Moderasicheck | 0.0507 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-f.png` | 144099 |
| `admin/moderasi_ulasan_dan_komentar_desktop.html#demo-menu` | `g` | Antrean Bersihcheck | 0.0280 | lulus | `admin/moderasi_ulasan_dan_komentar_desktop/state-g.png` | 103950 |
| `admin/monitoring_global_desktop.html#demo-menu` | `b` | Filter: 7 Haricheck | 0.0199 | lulus | `admin/monitoring_global_desktop/state-b.png` | 123458 |
| `admin/monitoring_global_desktop.html#demo-menu` | `c` | Filter: PT Mizancheck | 0.0197 | lulus | `admin/monitoring_global_desktop/state-c.png` | 121055 |
| `admin/monitoring_global_desktop.html#demo-menu` | `d` | Data Kosongcheck | 0.0136 | lulus | `admin/monitoring_global_desktop/state-d.png` | 114779 |
| `admin/monitoring_global_desktop.html#demo-menu` | `e` | Gagal Memuatcheck | 0.0309 | lulus | `admin/monitoring_global_desktop/state-e.png` | 100987 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `b` | Seluruh Katalogcheck | 0.0381 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-b.png` | 121893 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `c` | Detail Laporancheck | 0.7637 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-c.png` | 151099 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `d` | Konfirmasi Nonaktifkancheck | 0.9246 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-d.png` | 150525 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `e` | Konfirmasi Tutup Laporancheck | 0.9571 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-e.png` | 151261 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `f` | Notifikasi Suksescheck | 0.0183 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-f.png` | 129360 |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` | `g` | Antrean Kosongcheck | 0.0027 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-g.png` | 123845 |
| `admin/pengawasan_katalog_buku_global_desktop.html#mobile-sidebar` | `mobile-sidebar` | - | 0.6237 | lulus | `admin/pengawasan_katalog_buku_global_desktop/state-mobile-sidebar.png` | 55535 |
| `agenda#article-modal` | `article-modal` | - | 0.5940 | lulus | `user/agenda_berita_literasi_desktop/state-article-modal.png` | 327726 |
| `cart#empty` | `empty` | - | 0.1141 | lulus | `user/keranjang_pembayaran_terpadu_desktop/state-empty.png` | 58436 |
| `cart#snap` | `snap` | - | 0.8378 | lulus | `user/keranjang_pembayaran_terpadu_desktop/state-snap.png` | 159232 |
| `cart#status-berhasil` | `status-berhasil` | - | 0.0169 | lulus | `user/keranjang_pembayaran_terpadu_desktop/state-status-berhasil.png` | 137579 |
| `cart#status-kedaluwarsa` | `status-kedaluwarsa` | - | 0.0000 | lulus | `user/keranjang_pembayaran_terpadu_desktop/state-status-kedaluwarsa.png` | 131554 |
| `cart#status-menunggu` | `status-menunggu` | - | 0.0000 | lulus | `user/keranjang_pembayaran_terpadu_desktop/state-status-menunggu.png` | 131554 |
| `catalog#list-view` | `list-view` | - | 0.2850 | lulus | `user/katalog_buku_desktop/state-list-view.png` | 186250 |
| `catalog#no-results` | `no-results` | - | 0.2743 | lulus | `user/katalog_buku_desktop/state-no-results.png` | 90200 |
| `catalog#sort-last-option` | `sort-last-option` | - | 0.2605 | lulus | `user/katalog_buku_desktop/state-sort-last-option.png` | 633273 |

### 5.2 State yang belum berubah & sebabnya

| Resep / state | Bukti & sebab |
|---|---|
| `admin-catalog#reports` / `reports` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `admin-community#create` / `create` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `admin-monitoring#reset-filter` / `reset-filter` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `admin-payouts#drawer` / `drawer` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `admin/dashboard_administrasi_utama_desktop.html#demo-menu` / `a` | idem |
| `admin/kelola_pengguna_desktop.html#demo-menu` / `a` | idem |
| `admin/monitoring_global_desktop.html#demo-menu` / `a` | idem |
| `admin/pengawasan_katalog_buku_global_desktop.html#demo-menu` / `a` | idem |
| `agenda#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `agenda#featured-modal` / `featured-modal` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `cart#filled` / `filled` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `cart#order-details` / `order-details` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `cart#status-gagal` / `status-gagal` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `catalog#category-filter` / `category-filter` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `catalog#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `chatbot-page#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `community#explore` / `explore` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `detail#comment-menu` / `comment-menu` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `detail#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `detail#rating-filled` / `rating-filled` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `detail-agenda#invalid` / `invalid` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `forgot#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `help#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `home#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `library#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `onboarding#step1` / `step1` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `orders#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `penerbit/dashboard_penerbit_desktop.html#demo-menu` / `state-a` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `penerbit/dashboard_penerbit_desktop.html#demo-menu` / `state-b` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `penerbit/dashboard_penerbit_desktop.html#demo-menu` / `state-c` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `penerbit/dashboard_penerbit_desktop.html#demo-menu` / `state-d` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `penerbit/kelola_buku_desktop.html#demo-menu` / `filled` | chip `filled` adalah state default |
| `penerbit/pendapatan_dan_pencairan_desktop.html#demo-menu` / `a` | idem |
| `penerbit/pesanan_masuk_desktop.html#demo-menu` / `a` | chip `A` = Normal = state default |
| `penerbit/ulasan_pembeli_desktop.html#demo-menu` / `a` | idem |
| `preview#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `profile#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `reader#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `register#buyer` / `buyer` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `reviews#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `settings#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `status#demo-ok` / `demo-ok` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `status#demo-rejected` / `demo-rejected` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `status#pending` / `pending` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |
| `verify#default` / `default` | state default; perbedaan di bawah fold sudah dicek pada pass full-page |

## 6. Visual token terukur (computed style, 1440x900 kecuali disebut)

| Token | Nilai terukur | Sumber |
|---|---|---|
| Body font | `"DM Sans", ...` 16px, warna `rgb(34,34,37)` | 8 halaman sampel |
| Body background | `#FFFFFF`; halaman auth `rgb(245,245,246)` | beranda vs masuk_login |
| H1 | katalog 34px/42.5px, komunitas 40px/48px, admin 30px/37.5px | manifest `metrics.json` |
| H1 @390 | katalog 28px/35px, komunitas 32px/38.4px, admin 26px/32.5px | idem |
| H2 | 26px (beranda), 16-19px (katalog/komunitas/admin) | idem |
| Header buyer | tinggi **113px**, `position: fixed`, lebar penuh | beranda/katalog/detail/keranjang |
| Topbar portal | tinggi **64px**, `position: absolute` | penerbit & admin dashboard |
| Sidebar portal | **248px** lebar, mulai `y=64` (836px tinggi viewport) | penerbit & admin dashboard |
| Kolom konten buyer | H1 mulai `x=72` (katalog) | idem |
| Workspace portal | H1 mulai `x=312` (di samping sidebar 248px + gap) | admin dashboard |
| Panel filter katalog | `aside` 300px di `x=72, y=332` | katalog |
| Ringkasan keranjang | `aside` 411px di `x=957, y=262` | keranjang |
| Footer buyer | tinggi **364px**, lebar penuh | beranda/katalog/keranjang |
| Radius kontrol | 12px (input & tombol utama), 8px (tombol kecil katalog), `9999px` (pill) | katalog/detail/komunitas |
| Border input | `0px solid rgb(229,231,235)` (border utility dimatikan pada elemen tsb) | idem |
| Grid rak beranda | 4 kolom `~243px`, gap 20px; baris kedua 5 kolom `240px`, gap 24px | beranda |
| Grid katalog/komunitas | kolom `~78.6px` (thumb filter/ikon), gap 32px; layout utama 2 kolom `640px`, gap 16px | katalog/komunitas |
| Grid detail buku | 8 kolom 64px, gap 48px | detail buku |
| Overlay/dialog z-index | detail buku `z=90`, komunitas `z=85`, keranjang `z=50` (semua `position: fixed`) | idem |
| Keluarga ikon | `"Material Symbols Outlined"` | 3 halaman sampel |

## 7. Baseline defect (tidak diperbaiki di fase ini)

| # | Defect | Bukti | Status |
|---|---|---|---|
| D1 | JS runtime error di `admin/kelola_pencairan_dana_desktop.html` | Klik tombol `Periksa` pada baris tabel memicu `ReferenceError: editable is not defined`; drawer `#payout-drawer` tetap di `x=1440` (di luar layar) sehingga aksi tampak tidak bekerja. | viewport 1440x900, state klik baris · bukti: `states-final2.json` (`admin-payouts#drawer`, errors[0]) + probe `probe-interactions.mjs` | Cacat prototype, tidak diperbaiki di fase ini |
| D2 | Overflow horizontal 8px di `user/riwayat_ulasan_desktop.html` @320x700 | `documentElement.scrollWidth=328` vs viewport 320; elemen meluber: grup `div.min-w-0` pada kartu ulasan (right=328) di samping `nav` yang memang scroll region. | viewport 320x700 · bukti: `defects-probe.json` | Cacat prototype, tidak diperbaiki |
| D3 | Overflow horizontal 20px di `penerbit/invoice_penjualan_pdf_portal_penerbit.html` @320x700 | `scrollWidth=340` vs 320; penyebab `<table class="w-full border-collapse">` tanpa pembungkus `overflow-x-auto` (10 halaman lain memakainya). | viewport 320x700 · bukti: `defects-probe.json` | Cacat prototype, tidak diperbaiki |
| D4 | `<img src="">` placeholder memicu request ke halaman sendiri | 4 berkas punya gambar dengan `src` kosong yang diisi JS pada state tertentu: `#book-report-cover` (detail buku), `#event-cover` (detail agenda), `#profile-photo` (komunitas), `#det-cover` (kelola buku). Pada default state gambar kosong, dan 1 request sia-sia ke URL halaman terdeteksi. | 1440x900 · bukti: `defects-probe.json` (`#empty-src`, `#self-requests` = 1 per halaman) | Cacat prototype, tidak diperbaiki |
| D5 | Guard demo membuat halaman portal tidak independen | `user/komunitas_literasi_desktop.html` menulis `ikapi_buyer_session_demo` saat dimuat; di profil browser yang sama, `admin/admin-guard.js` kemudian mengalihkan SEMUA halaman admin ke `login_administrator_desktop.html?akses=blokir`. Untuk screenshot, setiap halaman wajib memakai profil bersih (sudah diterapkan di `capture.mjs`/`states.mjs`). | bukti: `_guardprobe` (komunitas -> sesi ditulis; admin -> final URL `admin/login_administrator_desktop.html`, `#demo-toggle` tidak ada); kontras: konteks bersih -> halaman admin render normal | Perilaku demo yang disengaja; didokumentasikan, bukan diperbaiki |
| D6 | Ketergantungan CDN saat baseline | 38 halaman memuat `https://cdn.tailwindcss.com` (Tailwind 3.4.17) dan Google Fonts; screenshot hanya valid bila jaringan aktif. Pada run ini 0 request gagal, `document.fonts.status='loaded'`, Material Symbols teresolusi `"Material Symbols Outlined"`. | bukti: `manifest.json` -> `failedRequests: []` di 190 entri | Risiko untuk CI/offline; mitigasi di P02 berikutnya (vendor CDN lokal saat implementasi) |
| D7 | Drawer admin/kelola komunitas sudah berada di layar pada default state | `#community-drawer` memiliki `x=920, w=520, vw=1440` (onscreen=true) pada load tanpa interaksi; tombol `Tambah Komunitas` hanya mengisi field (`drawerInputVisible` false -> true). | 1440x900 · bukti: `states-final2.json` (`admin-community#drawer-default`) | Perlu keputusan pemilik: apakah panel kanan memang selalu tampil |
| D8 | Em dash pada `<title>` | 31 dari 40 halaman memakai `—` di `<title>`; tidak ada em dash pada teks isi selain 7 berkas (portal + 3 halaman user). | bukti: audit P01 + `grep -c '—'` | Baseline defect, tidak diubah |

## 8. Cara mereproduksi

```sh
# 1. server statis di atas folder desain (dari akar repo)
cd docs/design && python -m http.server 8099 --bind 127.0.0.1

# 2. matriks 38 halaman x 5 viewport  (idempoten: entri yang sudah ada dilewati)
node docs/migration/tools/capture.mjs

# 3. state interaksi (menu Mode Demo, chip, modal, drawer, deep link, responsive)
node docs/migration/tools/states.mjs
node docs/migration/tools/states.mjs --full --tag --manifest=states-manifest-full.json --only="<key,key>"

# 4. verifikasi bahwa setiap state benar-benar berbeda dari default
node docs/migration/tools/verify-states.mjs
node docs/migration/tools/verify-states-full.mjs

# 5. diagnosa kontrol & defect (read-only)
node docs/migration/tools/probe-controls.mjs
node docs/migration/tools/probe-interactions.mjs
node docs/migration/tools/defects.mjs

# 6. visual diff manual antar dua golden PNG (tanpa dependensi)
node docs/migration/tools/imagediff.mjs <a.png> <b.png> out-diff.png --threshold=0
```

## 9. Metodologi visual diff

1. Bandingkan **viewport yang sama, engine yang sama, state yang sama** (`1440x900-viewport.png` vs `1440x900-viewport.png`).
2. `--threshold=0` secara default: satu digit byte yang berbeda dihitung berbeda. Ambang noise hanya boleh dinaikkan untuk anti-aliasing font pada run ulang mesin lain, dan setiap kenaikan wajib disertai diff image yang ditinjau.
3. Toleransi **tidak boleh** dipakai untuk perbedaan spacing, ukuran font, crop/`object-fit`, radius, warna, atau posisi - itu regresi.
4. Aturan keputusan: `ratio = 0` = identik; `0 < ratio <= 0.0005` = noise anti-aliasing (tinjau overlay); `> 0.0005` = perubahan nyata yang harus dijelaskan atau disetujui.
5. Selain piksel, setiap state diperiksa dengan assert DOM (contoh: `#modal-detail` tidak `hidden`, `#status-menunggu` `shown`, view `#view-reports`/`#view-catalog` berganti) supaya state di bawah fold tetap terbukti.

## 10. Gate P03

| Halaman prioritas | Sumber | Baseline viewport | Screenshot | State terverifikasi | Gate |
|---|---|---|---|---|---|
| homepage | `user/beranda_desktop.html` | 5/5 | 10 | default | **LULUS** |
| catalog | `user/katalog_buku_desktop.html` | 5/5 | 10 | list-view, mobile-nav-scroll, no-results, sort-last-option, category-filter | **LULUS** |
| detail buku | `user/detail_buku_desktop.html` | 5/5 | 10 | book-report, book-report-filled, rating-validation | **LULUS** |
| keranjang/checkout | `user/keranjang_pembayaran_terpadu_desktop.html` | 5/5 | 10 | empty, snap, status-berhasil, status-berhasil, status-gagal, status-kedaluwarsa + 1 lain | **LULUS** |
| community | `user/komunitas_literasi_desktop.html` | 5/5 | 10 | composer, data_kosong, direktori_normal, invalid-community, invalid-topic, mode_detail_komunitas + 4 lain | **LULUS** |
| login | `user/masuk_login_desktop.html` | 5/5 | 10 | default, invalid, loading, network, pending, publisher-tab + 1 lain | **LULUS** |
| publisher dashboard | `penerbit/dashboard_penerbit_desktop.html` | 5/5 | 10 | mobile-sidebar | **LULUS** |
| admin dashboard | `admin/dashboard_administrasi_utama_desktop.html` | 5/5 | 10 | b, c, d, mobile-sidebar, b, c + 1 lain | **LULUS** |

Halaman non-prioritas: seluruh 38 halaman sudah punya baseline 5 viewport (full + viewport) sehingga capture tambahan saat konversinya dimulai tinggal memakai skrip `states.mjs`.

## 11. Isu tersisa & serah terima ke P03

1. D1 (JS error + drawer pencairan admin) dan D7 (drawer komunitas tampil di default) perlu keputusan pemilik: perbaiki sebagai tugas terpisah atau pertahankan sebagai baseline.
2. D5 berarti setiap alat QA/reviewer **wajib memakai profil browser bersih per persona**; ini juga kandidat perbaikan nyata saat guard dipindah ke middleware di P03-P04.
3. Baseline ini terikat CDN Tailwind 3.4.17. Saat implementasi Tailwind 4 dimulai (P02 implementasi/P03), setiap perubahan visual wajib dibandingkan ke golden PNG di direktori ini, dan selisih yang disengaja dicatat sebagai keputusan.
4. Artefak 166.3 MB belum di-commit; tentukan penempatan (LFS/artifact store) sebelum P03 memproduksi lebih banyak.
5. Belum diuji (jujur): state yang bergantung pada `localStorage` lintas halaman (keranjang -> riwayat pesanan, laporan buku -> antrean admin) tidak dapat diuji karena prototype memang tidak menyambungkannya (lihat P01 bagian 5.3); baseline-nya berupa keadaan per halaman, bukan alur.

## 12. Perubahan di luar sesi ini (catatan integritas)

Saat fase ini berjalan, ada perubahan pada `docs/design/` yang **tidak dilakukan oleh fase P02** dan tidak dapat dicegah dari sini:

| Bukti | Nilai |
|---|---|
| `docs/design/stitch/` (arsip 65 berkas, dipakai P01 sebagai referensi mobile lama) | **hilang dari worktree**; `git status` mencatat 65 penghapusan yang belum di-stage |
| `docs/design/prototype-copy.zip` | berkas baru, 422.251 byte, 49 entri (semua di bawah `prototype-copy/`), mtime `2026-11-18 18:44:45`, **untracked** |
| `docs/design` (mtime direktori) | `2026-11-18 18:44:45` - detik yang sama dengan pembuatan zip |
| Berkas lain | 11+ berkas `docs/prompts/*.md` juga berubah (pemilik mengganti prompt) |

Tidak ada perintah fase P02 yang menyentuh `docs/design/stitch` (seluruh skrip hanya membaca `docs/design/prototype-copy` dan menulis ke `docs/migration/`), dan aturan "tidak menggunakan `git checkout`/`git reset`/`git stash`" tetap dipegang. Karena pemilik dapat saja menghapus arsip itu dengan sengaja, penghapusan **tidak dikembalikan**; bila arsip diperlukan lagi, isinya masih dapat dipulihkan dari commit `f243012` (`git show f243012:docs/design/stitch/...`).

Dampak pada baseline: **tidak ada**. Golden PNG P02 hanya berasal dari `docs/design/prototype-copy` + `docs/design/assets`, yang pada fase ini tetap 0 perubahan.
