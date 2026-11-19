# P01 - Inventaris Lengkap Sumber Prototype (HTML + Aset)

Fase: **P01 (audit/read-only)**. Dokumen ini tidak mengubah application code.
Sumber kebenaran visual: `docs/design/prototype-copy/{user,penerbit,admin}` + `docs/design/assets/`.
Dokumen pasangan: `docs/migration/p1-architecture-blueprint.md`.

## 1. Konteks repositori saat audit

| Item | Nilai terverifikasi |
|---|---|
| Repositori | `ghazyAlghifari508/prototype-IKAPI` |
| Branch aktif | `prototype-only` (HEAD `f243012`) |
| Branch `prototype` (diminta pemilik) | **TIDAK ADA** - tidak di lokal, tidak di remote (`git ls-remote --heads origin prototype` kosong) |
| Remote yang ada | `origin` = `https://github.com/ghazyAlghifari508/prototype-IKAPI.git` |
| Hubungan dengan `main` | `merge-base` = `9bde96e`; `prototype-only` **20 commit di depan**, 0 di belakang `origin/main` |
| `origin/main` | React + Inertia (`inertiajs/inertia-laravel ^3.0`, `@inertiajs/react ^3.0.0`, Radix UI) - **bukan** dasar migrasi |
| Working tree | bersih kecuali `docs/prompts/p1.md` (berkas prompt, berubah oleh pemilik) |
| Breeze | sudah bersih: 0 kemunculan di `composer.json`/`composer.lock`/`vendor/`/kode aktif |
| Aplikasi | Laravel 13.42.0, PHP 8.4.27, Blade + Tailwind **4.3.5** via Vite 6.4.6, Alpine 3.14.8 (terpasang, **0 pemakaian** di prototype) |
| Layout app | hanya `resources/views/welcome.blade.php` (40 baris); tidak ada layout/komponen lain |
| Route | `routes/web.php` -> `GET /` (name `home`) saja; total 4 route termasuk `storage/*` + `up` |
| Tests | `tests/Pest.php` + `TestCase` + 1 Feature + 1 Unit; `RefreshDatabase` tidak lagi dipasang global sehingga `php artisan test` lulus tanpa MySQL (2/2) |
| Lint/analisis | `phpstan analyse` (level 7) **lulus 0 error**; `pint --test` **GAGAL 1 file** (`tests/Pest.php`, `line_ending`) - lihat R12 di blueprint |
| Aset repo | `public/` hanya `robots.txt`, `favicon.*`, `apple-touch-icon.png`, `.htaccess`, `index.php`, `build/`; belum ada folder aset prototype |
| `AGENTS.md` / `GRAPH_REPORT.md` | **tidak ada** di repo (`.gitignore` memuat `/AGENTS.md`, `/CLAUDE.md`) |

### 1.1 Session, cache, queue, dan arti "frontend-only"

| Sumber | SESSION_DRIVER | CACHE_STORE | QUEUE_CONNECTION | Konsekuensi |
|---|---|---|---|---|
| `.env` lokal saat audit | `database` | `database` | `database` | `GET /` -> **HTTP 500** (`SQLSTATE[HY000] [2002] ... select * from sessions`, MySQL tidak jalan di port 3306) |
| `.env.example` (repo) | `file` | `file` | `sync` | `GET /` -> **HTTP 200** tanpa database |
| `phpunit.xml` | `array` | `array` | `sync` | tes tidak butuh DB selama tidak ada trait DB |

Fakta: aplikasi **tidak** memerlukan tabel database untuk fase migrasi Blade, tetapi `.env` lokal pemilik masih memakai driver `database` (sisa scaffold). Konsekuensi untuk P02-P11: setiap perintah verifikasi yang menyentuh request web harus dijalankan dengan driver file/sync (atau sesudah `.env` disesuaikan). **Tidak ada migrasi/seed/drop/truncate yang dijalankan** pada fase ini, dan tidak ada tabel yang dibuat.

### 1.2 Fondasi aplikasi yang diperiksa (read-only)

| Berkas | Temuan |
|---|---|
| `composer.json` | `require`: `php ^8.4`, `laravel/framework ^13.17`, `laravel/tinker ^3.0`. `require-dev`: pest, larastan, pint, sail, pail, pao, faker, mockery, collision. **Tidak ada `laravel/breeze`** |
| `package.json` | dev: `tailwindcss ^4.0.0` (terpasang 4.3.5), `@tailwindcss/vite`, `@tailwindcss/forms`, `vite ^6.2.0`, `alpinejs ^3.14.8`, `laravel-vite-plugin`, `playwright ^1.65.1` |
| `vite.config.js` | input `resources/css/app.css` + `resources/js/app.js`, plugin `laravel` + `tailwindcss`; tidak ada konfigurasi tambahan |
| `routes/web.php` | hanya `GET /` -> `view('welcome')`, name `home` |
| `resources/views` | 1 file: `welcome.blade.php` (memakai `@vite`, font bunny.net, konten IKAPI) |
| `resources/css/app.css` | `@import "tailwindcss"`, `@plugin "@tailwindcss/forms"`, `@source` ke Blade pagination, `@theme` hanya mengatur `--font-sans: Figtree`; **tidak ada** `@source` ke `docs/` sehingga kelas prototype tidak ikut build |
| `resources/js/app.js` | hanya bootstrap Alpine (`Alpine.start()`), tanpa komponen |
| `public/` | `robots.txt`, `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `.htaccess`, `index.php`, `build/` (hasil Vite); belum ada `assets/ikapi/` |
| `.env.example` | driver `file`/`sync`; DB MySQL `ikapi_marketplace` tetap ada |
| `tests/` | `Pest.php` (bind `TestCase`, tanpa `RefreshDatabase`), `TestCase.php`, `Feature/ExampleTest` (assert `/` 200), `Unit/ExampleTest` |
| `phpstan.neon` / `pint.json` | larastan level 7 (paths app/config/database/routes/bootstrap), preset `laravel` |
| `.github/workflows/tests.yml` | CI: MySQL service, `php artisan migrate --force`, `composer lint:check`, `npm run build`, `php artisan test` |
| Styling / Breeze | Tailwind 4 + forms plugin aktif; **Breeze tidak aktif dan tidak ada lagi file scaffold Breeze** (tidak ada `routes/auth.php`, `app/Http/Controllers/Auth`, `resources/views/{auth,profile,layouts,components}`) |

## 2. Ringkasan cakupan

| Jenis | Jumlah | Catatan |
|---|---|---|
| Halaman (page) | 38 | 22 buyer/auth-demo, 7 penerbit, 9 admin |
| Redirect (alias) | 2 | duplikat UI, dipertahankan, tidak dihapus |
| Script runtime | 3 | 2 guard + 1 widget; ikut ke `public/assets/ikapi/js/` |
| Design doc | 2 | PRD + design system (arsip, sumber requirement) |
| **Total file di `prototype-copy`** | **45** | 38 halaman + 2 redirect + 3 script + 2 design doc |
| Aset di `docs/design/assets` | 76 | 41 dipakai prototype, 35 belum dipakai, 0 referensi rusak |
| Halaman mobile di `prototype-copy` | **0** | 30 file `*_mobile.html` sudah dihapus di commit `7a9aec6` |
| Salinan mobile lama | 31 | hanya di `docs/design/stitch/` (read-only), **semuanya palet lama `#5956E9`** |
| Baris total kode prototype | 33.178 | 40 HTML + 3 JS (1,84 MB) |

### 2.1 Akuntansi halaman per persona

- **Buyer + auth-demo (22)**: beranda, katalog, detail buku, preview buku, web reader, keranjang/checkout, riwayat pesanan, perpustakaan, riwayat ulasan, profil, pengaturan akun, bantuan, agenda, detail agenda, komunitas, chatbot, login, register, lupa sandi, verifikasi email, onboarding, status pendaftaran penerbit.
- **Penerbit (10 file = 7 halaman + 2 alias + 1 script)**: dashboard, kelola buku, pesanan masuk, pendapatan & pencairan, ulasan pembeli, pengaturan profil, invoice, `masuk_portal_penerbit` (alias), `pendaftaran_penerbit` (alias), `access-guard.js`.
- **Admin (10 file = 9 halaman + 1 script)**: dashboard, kelola pengguna, pengawasan katalog, moderasi ulasan, monitoring global, kelola pencairan, kelola komunitas, moderasi diskusi, login administrator, `admin-guard.js`.

## 3. Audit perilaku dan data

Metode: menelusuri alur pada sumber (bukan asumsi), menghitung pemakaian API browser, dan memetakan tiap key penyimpanan ke penulis/pembacanya (`facts2.json` + verifikasi manual pada kode).

### 3.1 Alur yang benar-benar berjalan

| Alur | Bukti | Terhubung? |
|---|---|---|
| Beranda -> Katalog -> Detail | `beranda` 9 tautan keluar, `katalog` 8; semua kartu `href="detail_buku_desktop.html"` tanpa parameter -> detail selalu buku `BK-01` | Ya, tetapi identitas buku hilang |
| Detail -> Preview -> Reader | `btnSamplePreview` -> `preview_buku_desktop.html` -> `web_reader_desktop.html` (perpustakaan -> reader juga ada) | Ya, tanpa ID buku |
| Detail -> Keranjang | tombol `btnAddToCart` hanya `showToast`, **tidak** menyimpan apa pun; keranjang berisi 2 item hard-code | Tidak |
| Keranjang -> Checkout -> Status | 1 halaman dengan 4 blok status (`status-berhasil`, `status-menunggu`, `status-gagal`, `status-kedaluwarsa`) dipicu `setDemoPaymentStatus()`; `checkPaymentStatus()` hanya toast | Ya, sebagai simulasi statis |
| Checkout -> Riwayat Pesanan | keranjang tidak menulis apa pun; riwayat memakai `ordersData` (11 item) | Tidak |
| Login (buyer/penerbit) | `DEMO_ACCOUNTS` 3 akun; buyer -> `perpustakaan_saya`, penerbit approved -> `../penerbit/dashboard_penerbit`, pending -> panel "meninjau"; `safeNext()` membatasi `next` ke pola nama file | Ya |
| Register | buyer -> `onboarding_preferensi_bacaan`; penerbit 3 langkah -> menulis `ikapi_publisher_application_demo` -> `status_pendaftaran_penerbit` | Ya |
| Pengajuan penerbit -> portal | `access-guard.js` membaca status; `approved` lolos, `pending`/`rejected` -> `status_pendaftaran?akses=blokir`; tanpa storage = lolos | Ya (demo) |
| Komunitas | 5 subview (`view-explore`, `view-profile`, `view-room`, `view-topic`, `view-reply`); deep link `?komunitas=`, `?topik=`, `?balas=`; topik/balasan disimpan ke `ikapi_community_topics_demo`/`ikapi_community_replies_demo`; balasan punya `parentReplyId`, kedalaman maks 2 (`THREAD_MAX_DEPTH`), lebih dalam diratakan dengan label "Membalas [Nama]"; akses "Buat Topik" dijaga `canPostIn()` + atribut `disabled` native | Ya |
| Moderasi admin | `moderasi_diskusi` menulis `ikapi_discussion_reports_demo` dengan status `kept`/`pending`/`removed`; `kelola_komunitas` menulis `ikapi_communities_demo` (dibaca halaman komunitas) | Ya |
| Laporan buku/komentar -> admin | `ikapi_book_reports_demo` dan `ikapi_comment_reports_demo` hanya ditulis halaman detail; **tidak ada** halaman admin/penerbit yang membacanya | Tidak |
| Admin: pengguna, katalog, ulasan, pencairan, monitoring | 5 halaman dengan tabel + drawer + modal; semua data dari konstanta lokal (`BASE_USERS`, `BASE_REPORTS`, `BASE_PAYOUTS`, `BASE_TX`) | Ya, statis |

### 3.2 Audit API & pola JS (agregat 40 halaman)

| Item | Jumlah | Catatan |
|---|---|---|
| `fetch` / `XMLHttpRequest` / `axios` | **0** | seluruh prototype offline |
| Handler inline `on*` | **218** | semua di 18 dari 22 halaman user; portal 0 |
| `addEventListener` | **450** | admin 179, user 160, penerbit 111 |
| `innerHTML` | **73** di 28 halaman | render kartu/tabel dari data JS |
| `insertAdjacentHTML` | 0 | - |
| Template literal berisi HTML | 53 | wajib memakai daftar kelas utuh saat pindah ke Blade |
| `location.href=` / `replace()` / `assign()` | 9 | 7 di script inline + 1 di masing-masing guard (`access-guard.js`, `admin-guard.js`) |
| `window.open` | 0 | - |
| `history.pushState/replaceState/back` | 2 | hanya login & register (membersihkan query); **0** `popstate`/`hashchange` |
| `setTimeout` / `setInterval` | 60 | termasuk 1 timer toast per halaman |
| `alert`/`confirm`/`prompt` | 0 | semua dialog memakai modal DOM (baik) |
| `document.getElementById`/`$('#id')` unik per halaman | 105 (komunitas) dst. | id harus tetap sama saat konversi agar JS tidak pecah |
| Kelas dibuat dinamis (`classList.*`, string concat) | **1.070** pemanggilan `classList` + 1 halaman memakai pola `'bg-' + x` | risiko ter-purge di Tailwind 4 |
| Query param dibaca | `role`, `next`, `email`, `id`, `tab`, `komunitas`, `topik`, `balas`, `akses`, `sesi` | 10 param; semuanya harus tetap bekerja |
| URL eksternal | Google Fonts (38 halaman), `cdn.tailwindcss.com` (38), Material Symbols (38) | **0** gambar/script dari domain lain |
| Gambar remote | **0** | semua aset lokal `../../assets/...` |

### 3.3 Guard demo dan state

| Guard | Cakupan | Perilaku |
|---|---|---|
| `penerbit/access-guard.js` | 7 halaman portal penerbit (disisipkan di `<head>`) | status != approved -> `status_pendaftaran?akses=blokir`; tanpa data = lolos |
| `admin/admin-guard.js` | 8 halaman admin (disisipkan di `<head>`) | sesi buyer -> `login_administrator?akses=blokir`; tanpa data = lolos |
| `user/chatbot-widget.js` | 5 halaman user (`defer` di akhir body) | widget mengambang + 4 baris saran; global bernamespace `ikapiChat*` |

State yang harus tetap dapat dipicu sesudah migrasi: **28 halaman** punya id state (`empty`, `noresults`, `error`, `loading`, `skeleton`), 24 halaman punya toast, 19 halaman memakai `role="dialog"` (18 `aria-modal`), 8 halaman memakai panel drawer.

### 3.4 Koneksi antarhalaman yang tidak ada

Didaftar lengkap (beserta kontrak tiruan yang diusulkan) di `p1-architecture-blueprint.md` bagian 5.3. Ringkas: katalog->detail tanpa ID, detail->keranjang tanpa persistensi, checkout->riwayat tidak tersambung, perpustakaan->reader memakai key berbeda, laporan buku/komentar tidak dibaca admin, laporan diskusi punya 2 penulis. **Tidak dikarang**: semua di atas dicatat sebagai kondisi nyata prototype.

## 4. Audit styling dan responsive

### 4.1 Token dan konfigurasi

| Item | Fakta |
|---|---|
| Tailwind CDN | **v3.4.17** (dari isi `cdn.tailwindcss.com`), 38 halaman |
| Tailwind repo | **v4.3.5** + `@tailwindcss/forms` (plugin aktif, terlihat di CSS hasil build), Vite 6 |
| `tailwind.config` per halaman | **9 varian berbeda** di 38 halaman berconfig; 2 redirect tanpa config |
| Variabel `:root` / CSS custom | 40 halaman punya blok `<style>` sendiri (total 47 KB: user 24 KB, admin 12 KB, penerbit 11 KB) |
| Kelas kustom non-Tailwind | `.focus-ring` (571 token di 501 atribut class, 20 halaman), `.focus-ring-light` (56/42, 14 halaman), `.shell-main` (42/14, 14 halaman), `.banner-bleed` (42/14, 14 halaman), `.invoice-sheet` (8/1), `.no-print` (2/1), `.scrollbar-none` (54/18, 18 halaman), `.theme-border` (21/16, khusus web reader), `.animate-in`/`.fade-in`, connector thread komunitas |
| Arbitrary values | 1.120 token unik (`min-w-[18px]`, `h-[276px]`, `text-[13.5px]`, `shadow-[0_16px_40px_rgba(34,34,37,0.12)]`, `w-[min(92vw,420px)]`, dst.) |
| Breakpoint kustom | tidak ada; hanya `sm`/`md`/`lg`/`xl`/`2xl` bawaan |
| Grid | pola `grid-cols-1/2/3/4/12` dominan (54/51/24/22/21 pemakaian); tidak ada grid kustom |
| `darkMode` | `class` di 18 config, tetapi hanya `web_reader` yang benar-benar memakai `dark:` (18 pemakaian) |
| Overlay | `z-index` dipakai di 21 halaman; nilai tertinggi `z-95` (dipakai untuk modal/overlay/toast) |
| Header | `sticky`/`fixed` di 34 halaman |
| Crop gambar | `object-cover` di 22 halaman (81 pemakaian); `aspect-[...]` 46 pemakaian + `aspect-video/square` 10 |
| Ikon | Material Symbols Outlined di 38 halaman (2 bentuk URL), selalu berpasangan dengan teks di menu |
| Font | DM Sans (38 halaman), Plus Jakarta Sans (18 halaman, hanya 1 yang benar-benar memakai sebagai `font-family`), Literata (2 halaman: `preview_buku`, `web_reader`) |
| Aksesibilitas | 21 halaman memuat `@media (prefers-reduced-motion: reduce)`; `aria-modal` 18 halaman; 0 `alert()`/`confirm()` |

### 4.2 Desktop vs mobile

| Fakta | Nilai |
|---|---|
| Halaman mobile di sumber sekarang | 0 (dihapus di `7a9aec6`) |
| Salinan mobile lama | 31 file di `docs/design/stitch/` (read-only), semua palet **`#5956E9`** (bukan palet sekarang `#673DE6`) |
| Mobile lama yang berupa redirect | 0 (semuanya halaman nyata, 12-60 KB) |
| Halaman desktop dengan varian responsif | 40/40 (semua punya minimal satu `sm:`/`md:`/`lg:`) |
| Navigasi mobile | 16 halaman punya tombol menu/hamburger (portal penerbit+admin, beranda, web reader); 6 halaman akun buyer memakai sidebar off-canvas (`-translate-x-full`) |
| Tabel di layar kecil | 11 halaman ber-`<table>`, 10 di antaranya memakai `overflow-x-auto`; `invoice` tidak |
| `min-w` besar | 10 halaman portal menetapkan `min-w-[...]px` >= 640px (dikompensasi `overflow-x-auto`) |

**Kesimpulan**: karena versi mobile lama memakai palet dan tata bahasa visual yang sudah tidak dipakai, dan 40/40 halaman desktop sudah punya varian responsif sendiri, satu Blade responsif per halaman adalah rencana yang masuk akal. Halaman mobile tidak direkonstruksi sebagai file terpisah; gap mobile yang masih ada (portal tabel, sidebar) adalah pekerjaan pemolesan di fase komponen, bukan halaman baru.

## 5. Halaman kanonis dan alias

| Jenis | File | Bukti |
|---|---|---|
| Alias (redirect 0 detik) | `penerbit/masuk_portal_penerbit_desktop.html` | `<link rel="canonical" href="../user/masuk_login_desktop.html?role=publisher">` + `<meta http-equiv="refresh" content="0; ...">` + `location.replace(...)`; isi hanya kartu "Lanjut ke Masuk" |
| Alias (redirect 0 detik) | `penerbit/pendaftaran_penerbit_desktop.html` | canonical + refresh + `location.replace` ke `../user/daftar_akun_register_desktop.html?role=publisher`; **yatim** (0 halaman menautkannya) |
| Kanonis (auth terpadu) | `user/masuk_login_desktop.html`, `user/daftar_akun_register_desktop.html` | 18 dan 11 halaman menautkannya; dukung `?role=buyer|publisher` |
| Yatim lain | `user/verifikasi_email_desktop.html` | 0 halaman menautkan; hanya bisa dibuka langsung; `?email=` opsional |

Keputusan P01: dua alias penerbit **tetap ada** sebagai route redirect (`publisher.login`, `publisher.register`) yang mengarah ke route auth terpadu, supaya URL lama tidak hilang. Tidak ada duplikasi UI yang perlu dihapus.

## 6. Inventaris halaman (satu baris per file)

| # | Path sumber | Jenis | Persona | Judul / H1 | Section & state utama | Dialog/drawer | Sumber data dummy | localStorage key | Query param | Asset | Link internal | Target Blade | Named route | Status | Risiko konversi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `admin/dashboard_administrasi_utama_desktop.html` | page | admin | Dashboard Administrator - IKAPI Jawa Barat | - ; state: activity-empty, queue-empty, queue-empty-desc, queue-empty-title, view-data, view-error | - | - | - | - | 1 | 9 | `admin/dashboard` | `admin.dashboard` | kanonis | State loading/error/empty; antrean moderasi ringkas |
| 2 | `admin/kelola_komunitas_desktop.html` | page | admin | Kelola Komunitas - Portal Administrator IKAPI Jawa Barat | - ; state: form-error, state-empty, status-filter, view-focus, view-full, view-location | community-drawer | - | ikapi_communities_demo, ikapi_community_topics_demo | - | 5 | 9 | `admin/communities` | `admin.communities` | kanonis | CRUD komunitas; menulis ikapi_communities_demo (dibaca halaman user) |
| 3 | `admin/kelola_pencairan_dana_desktop.html` | page | admin | Kelola Pencairan Dana - Portal Administrator IKAPI Jawa Barat | reject-reason-block ; state: reject-error, state-empty, state-noresults | payout-drawer, finalize-title, reject-title, preview-title | - | - | - | 3 | 9 | `admin/payouts` | `admin.payouts` | kanonis | Tabel + drawer + finalize/reject modal |
| 4 | `admin/kelola_pengguna_desktop.html` | page | admin | Kelola Pengguna - Portal Administrator IKAPI Jawa Barat | reject-reason-block ; state: reject-error, state-empty, state-empty-desc, state-empty-title, state-noresults, status-filter | user-drawer, approve-title, reject-title, deactivate-title | - | - | - | 2 | 9 | `admin/users` | `admin.users` | kanonis | Tabel + drawer + modal setujui/tolak/nonaktifkan |
| 5 | `admin/login_administrator_desktop.html` | page | admin | Masuk Administrator - IKAPI Store Jawa Barat | - ; state: email-error, password-error | - | - | ikapi_admin_session_demo | akses | 1 | 2 | `admin/login` | `admin.login` | kanonis | ?akses=blokir; sesi preview admin; 5 skenario demo |
| 6 | `admin/moderasi_diskusi_komunitas_desktop.html` | page | admin | Moderasi Diskusi Komunitas - Portal Administrator IKAPI Jawa Barat | context-block ; state: count-pending, state-empty, tab-pending | review-drawer | - | ikapi_communities_demo, ikapi_community_replies_demo, ikapi_community_topics_demo, ikapi_discussion_reports_demo | - | 1 | 9 | `admin/discussion-moderation` | `admin.discussion-moderation` | kanonis | Antrean laporan diskusi; status kept/pending/removed |
| 7 | `admin/moderasi_ulasan_dan_komentar_desktop.html` | page | admin | Moderasi Ulasan & Komentar - Portal Administrator IKAPI Jawa Barat | - ; state: drawer-reply-empty, state-nodata, state-noresults, state-queue-empty | mod-drawer, delete-title | - | - | - | 5 | 9 | `admin/review-moderation` | `admin.review-moderation` | kanonis | Antrean laporan + drawer tinjau |
| 8 | `admin/monitoring_global_desktop.html` | page | admin | Monitoring Global - Portal Administrator IKAPI Jawa Barat | - ; state: btn-reset-empty, chart-empty, state-empty, view-data, view-error | - | - | - | - | 1 | 9 | `admin/monitoring` | `admin.monitoring` | kanonis | Chart statis + tabel transaksi; state error |
| 9 | `admin/pengawasan_katalog_buku_global_desktop.html` | page | admin | Pengawasan Katalog - Portal Administrator IKAPI Jawa Barat | - ; state: btn-reset-empty, catalog-empty, reports-empty, takedown-error, view-catalog, view-reports | catalog-drawer, takedown-title, close-report-title | - | - | - | 2 | 9 | `admin/catalog` | `admin.catalog` | kanonis | 2 view (katalog/laporan) + drawer + takedown |
| 10 | `penerbit/dashboard_penerbit_desktop.html` | page | publisher | Dashboard Penerbit - IKAPI Jawa Barat | chart-panel, eval-panel, analytics-error, table-container ; state: analytics-error, view-data, view-state-c | - | - | - | - | 1 | 7 | `publisher/dashboard` | `publisher.dashboard` | kanonis | KPI hard-code; guard akses; chart dari data statis |
| 11 | `penerbit/invoice_penjualan_pdf_portal_penerbit.html` | page | publisher | Invoice Penjualan - IKAPI Jawa Barat | - | - | - | - | - | 1 | 1 | `publisher/invoice` | `publisher.invoice` | kanonis | Layout cetak; data INVOICE statis; tanpa tautan masuk |
| 12 | `penerbit/kelola_buku_desktop.html` | page | publisher | Kelola Buku - Portal Penerbit IKAPI Jawa Barat | - ; state: state-draft-empty, state-empty, state-noresults, view-loading, view-table | modal-detail-title, modal-book-title, modal-unpublish-title | - | - | - | 8 | 7 | `publisher/books` | `publisher.books` | kanonis | Tabel + 3 modal + form tambah; state loading/empty/noresults |
| 13 | `penerbit/pendapatan_dan_pencairan_desktop.html` | page | publisher | Pendapatan & Pencairan - Portal Penerbit IKAPI Jawa Barat | - ; state: bank-card-empty, bank-empty, confirm-error, history-empty, kpi-pending, modal-success | confirm-title, success-title, detail-title | - | - | - | 1 | 7 | `publisher/payouts` | `publisher.payouts` | kanonis | Alur ajukan pencairan + modal konfirmasi/sukses/detail |
| 14 | `penerbit/pengaturan_profil_desktop.html` | page | publisher | Pengaturan Profil - Portal Penerbit IKAPI Jawa Barat | - ; state: bank-empty, view-error, view-main | bank-confirm-title, unsaved-title | - | - | - | 1 | 7 | `publisher/settings` | `publisher.settings` | kanonis | 2 form + modal rekening/unsaved; toast |
| 15 | `penerbit/pesanan_masuk_desktop.html` | page | publisher | Pesanan Masuk - Portal Penerbit IKAPI Jawa Barat | - ; state: state-empty, state-noresults, view-loading, view-table | detail-title | - | - | - | 6 | 8 | `publisher/orders` | `publisher.orders` | kanonis | BASE_ORDERS 10 item; drawer detail |
| 16 | `penerbit/ulasan_pembeli_desktop.html` | page | publisher | Ulasan Pembeli - Portal Penerbit IKAPI Jawa Barat | - ; state: state-empty, state-noresults | - | - | - | - | 6 | 7 | `publisher/reviews` | `publisher.reviews` | kanonis | Filter semua/dibalas/belum; balas ulasan inline |
| 17 | `user/agenda_berita_literasi_desktop.html` | page | buyer | Agenda & Berita Literasi - IKAPI Store Jawa Barat | section-berita ; state: articles-empty-state, btn-state-empty-events, btn-state-empty-news, events-empty-desc, events-empty-state | modal-featured-detail, modal-article-preview | - | - | - | 9 | 9 | `buyer/agenda` | `agenda` | kanonis | articlesData + eventsData + ics; modal detail; tautan ?id=ev-N valid |
| 18 | `user/akun_saya_profil_dropdown_navigasi_desktop.html` | page | buyer | Profil Saya - IKAPI Store Jawa Barat | - | - | - | ikapi_user_profile | - | 1 | 13 | `buyer/profile` | `profile.show` | kanonis | Sumber tunggal ikapi_user_profile; dropdown akun jadi pola 6 halaman |
| 19 | `user/bantuan_akun_desktop.html` | page | buyer | Pusat Bantuan - IKAPI Store Jawa Barat | - ; state: faq-empty-state | - | - | ikapi_user_profile | - | 2 | 13 | `buyer/help` | `help` | kanonis | faqData 8 item; membaca profil; tanpa tautan balik ke chatbot |
| 20 | `user/beranda_desktop.html` | page | buyer | IKAPI Store Jawa Barat - Toko E-Book Resmi Penerbit Daerah | - | - | - | - | - | 25 | 10 | `buyer/home` | `home` | kanonis | Hero + 4 rak buku; semua kartu menuju detail tanpa ID; badge keranjang hard-code |
| 21 | `user/chatbot_bantuan_rekomendasi_desktop.html` | page | buyer | Bantuan & Rekomendasi Buku - IKAPI Store Jawa Barat | - ; state: btn-state-loading | ikapi-chat-window | - | - | - | 5 | 11 | `buyer/chatbot` | `chatbot` | kanonis | Halaman penuh + widget global; tanpa backend; balasan statis |
| 22 | `user/daftar_akun_register_desktop.html` | page | auth-demo | Daftar Akun - IKAPI Jawa Barat | - ; state: error-title, step-label, step-title, step-track | - | - | ikapi_publisher_application_demo, ikapi_publisher_status_preview | role | 1 | 4 | `auth-demo/register` | `register` | kanonis | 2 alur (buyer 1 langkah, penerbit 3 langkah); menulis pengajuan penerbit |
| 23 | `user/detail_agenda_desktop.html` | page | buyer | Detail Agenda - IKAPI Store Jawa Barat | event-not-found | - | - | - | id | 5 | 8 | `buyer/agenda-detail` | `agenda.show` | kanonis | Membaca ?id=; state tidak ditemukan tersedia; hanya ditautkan dari agenda |
| 24 | `user/detail_buku_desktop.html` | page | buyer | Laskar Aksara Pasundan - Detail Buku IKAPI Store Jawa Barat | BK-01, section-rating ; state: book-report-error, book-report-error-text, book-report-error-title, report-error | report-modal, book-report-modal | - | ikapi_book_reports_demo, ikapi_comment_reactions_demo, ikapi_comment_reports_demo, ikapi_rating_laskar_aksara | - | 6 | 10 | `buyer/book-detail` | `book.show` | kanonis | Hanya 1 buku hard-code BK-01; rating + laporan buku/komentar di localStorage |
| 25 | `user/katalog_buku_desktop.html` | page | buyer | Katalog Buku Digital - IKAPI Store Jawa Barat | - ; state: catalog-empty-state | - | - | - | - | 13 | 9 | `buyer/catalog` | `catalog` | kanonis | 12 buku di JS; filter/pencarian client-side; 14 input; render via template literal |
| 26 | `user/keranjang_pembayaran_terpadu_desktop.html` | page | buyer | Keranjang Belanja - IKAPI Store Jawa Barat | - ; state: cart-empty-view, status-berhasil, status-berhasil-total, status-expired-order-id, status-failed-order-id, status-gagal | snap-overlay | - | - | - | 4 | 10 | `buyer/cart` | `cart` | kanonis | 2 item hard-code + 4 status pembayaran; tanpa storage; tanpa kaitan ke riwayat |
| 27 | `user/komunitas_literasi_desktop.html` | page | buyer | Komunitas Literasi - IKAPI Store Jawa Barat | hero-section, view-explore, view-profile, view-room ; state: btn-empty-new-topic, composer-error, discussion-report-error, profile-discussion-empty, reply-empty, reply-error | composer-modal, discussion-report-modal, delete-modal, leave-modal | - | ikapi_buyer_session_demo, ikapi_communities_demo, ikapi_community_memberships_demo, ikapi_community_replies_demo, ikapi_community_seed_version, ikapi_ | balas, komunitas, topik | 7 | 9 | `buyer/community` | `community` | kanonis | 5 subview + 7 key storage; deep link ?komunitas/?topik/?balas; file terbesar (144KB) |
| 28 | `user/lupa_kata_sandi_desktop.html` | page | auth-demo | Lupa Kata Sandi - IKAPI Store Jawa Barat | - ; state: success-banner | - | - | - | role | 1 | 2 | `auth-demo/forgot-password` | `password.request` | kanonis | ?role= mengubah teks balik ke login; sukses banner lokal |
| 29 | `user/masuk_login_desktop.html` | page | auth-demo | Masuk - IKAPI Jawa Barat | - ; state: email-error-msg, error-title, password-error-msg, pending-back, pending-panel | - | - | ikapi_buyer_session_demo | next, role | 1 | 4 | `auth-demo/login` | `login` | kanonis | 2 peran (buyer/publisher) + 6 skenario demo; ?role/?next; menulis sesi buyer |
| 30 | `user/onboarding_preferensi_bacaan_desktop.html` | page | buyer | Preferensi Bacaan - IKAPI Store Jawa Barat | - ; state: step-label, step-progress | - | - | ikapi_reading_prefs_demo | - | 1 | 1 | `buyer/onboarding` | `onboarding` | kanonis | 4 langkah; menulis ikapi_reading_prefs_demo; hanya ditautkan dari register |
| 31 | `user/pengaturan_akun_desktop.html` | page | buyer | Pengaturan Akun - IKAPI Store Jawa Barat | - | modal-change-password | - | ikapi_user_preferences, ikapi_user_profile | - | 1 | 13 | `buyer/settings` | `profile.settings` | kanonis | 2 key (profil + preferensi); modal ganti sandi |
| 32 | `user/perpustakaan_saya_desktop.html` | page | buyer | Perpustakaan Saya - IKAPI Store Jawa Barat | - ; state: empty-state-cta, empty-state-cta-text, empty-state-desc, empty-state-title | - | - | ikapi_user_profile | tab | 6 | 14 | `buyer/library` | `library` | kanonis | ?tab=all/reading/unread/favorite diterima tapi tidak ada tautan yang mengirimnya |
| 33 | `user/preview_buku_desktop.html` | page | buyer | Cuplikan: Laskar Aksara Pasundan - IKAPI Store Jawa Barat | - | - | - | - | - | 0 | 1 | `buyer/book-preview` | `book.preview` | kanonis | samplePages 7KB; tidak menerima parameter buku; keluar ke detail tanpa ID |
| 34 | `user/riwayat_pesanan_desktop.html` | page | buyer | Riwayat Pesanan - IKAPI Store Jawa Barat | - ; state: orders-empty-desc, orders-empty-state, tab-filter-pending, tab-filter-success | modal-order-detail | - | ikapi_user_profile | - | 8 | 13 | `buyer/orders` | `orders` | kanonis | ordersData hard-code; filter tab; membaca profil dari storage |
| 35 | `user/riwayat_ulasan_desktop.html` | page | buyer | Riwayat Ulasan - IKAPI Store Jawa Barat | - ; state: reviews-empty-state | modal-edit-review, modal-delete-confirm | - | ikapi_rating_laskar_aksara, ikapi_user_profile, ikapi_user_review_history | - | 4 | 14 | `buyer/reviews` | `reviews` | kanonis | initialUserReviews + edit/hapus; menulis ulang key rating buku |
| 36 | `user/status_pendaftaran_penerbit_desktop.html` | page | publisher | Status Pendaftaran Penerbit - IKAPI Jawa Barat | - ; state: detail-empty, notice-block, notice-heading, notice-text, status-description, status-heading | - | - | ikapi_publisher_application_demo, ikapi_publisher_status_preview | akses, sesi | 1 | 1 | `buyer/publisher-status` | `publisher.status` | kanonis | 3 status + mode demo terpisah; ?akses=blokir, ?sesi=aktif |
| 37 | `user/verifikasi_email_desktop.html` | page | auth-demo | Verifikasi Email - IKAPI Store Jawa Barat | - | - | - | - | email | 1 | 2 | `auth-demo/verify-email` | `verification.notice` | kanonis | YATIM: tidak ada satu pun halaman lain menautkannya; ?email= opsional |
| 38 | `user/web_reader_desktop.html` | page | buyer | Laskar Aksara Pasundan - Web Reader IKAPI Store | - | modal-unlicensed | - | ikapi_reader_bookmarks, ikapi_reader_pos_laskar_aksara, ikapi_reader_settings | - | 1 | 2 | `buyer/reader` | `reader` | kanonis | 3 key storage reader; dark mode + tema via CSS custom; modal lisensi |

## 7. Inventaris redirect dan script

| # | Path sumber | Jenis | Persona | Judul / H1 | Section & state utama | Dialog/drawer | Sumber data dummy | localStorage key | Query param | Asset | Link internal | Target Blade | Named route | Status | Risiko konversi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `penerbit/masuk_portal_penerbit_desktop.html` | redirect | publisher | Mengalihkan - Portal Penerbit IKAPI Jawa Barat | - | - | - | - | - | 0 | 1 | `-` | `-` | alias | Redirect 0 detik ke user/masuk_login_desktop.html?role=publisher |
| 2 | `penerbit/pendaftaran_penerbit_desktop.html` | redirect | publisher | Mengalihkan - Portal Penerbit IKAPI Jawa Barat | - | - | - | - | - | 0 | 1 | `-` | `-` | alias | Redirect 0 detik ke user/daftar_akun_register_desktop.html?role=publisher; yatim (tak ditautkan) |
| 3 | `admin/admin-guard.js` | script | admin | admin-guard.js | - | - | - | ikapi_admin_session_demo, ikapi_buyer_session_demo | - | 0 | 0 | `public/assets/ikapi/js/admin-guard.js` | `-` | kanonis (aset runtime) | Gate 8 halaman; buyer diblokir, tanpa sesi lolos |
| 4 | `penerbit/access-guard.js` | script | publisher | access-guard.js | - | - | - | ikapi_publisher_application_demo | - | 0 | 0 | `public/assets/ikapi/js/access-guard.js` | `-` | kanonis (aset runtime) | Gate demo 7 halaman; tanpa storage = lolos (reviewer) |
| 5 | `user/chatbot-widget.js` | script | buyer | chatbot-widget.js | - | - | - | - | - | 1 | 0 | `public/assets/ikapi/js/chatbot-widget.js` | `-` | kanonis (aset runtime) | Widget global 5 halaman; global ikapiChat*; tanpa backend |

## 8. Inventaris design doc pendamping

| # | Path sumber | Jenis | Persona | Judul / H1 | Section & state utama | Dialog/drawer | Sumber data dummy | localStorage key | Query param | Asset | Link internal | Target Blade | Named route | Status | Risiko konversi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `user/design_3md.md` | design doc | - | design_3md.md | - | - | - | - | - | 0 | 0 | `-` | `-` | referensi (bukan halaman) | Palet lama #5956E9; arsip, jangan dipakai sebagai sumber token |
| 2 | `user/ikapi_store_prd_pembeli_stitch_v1md.md` | design doc | buyer | ikapi_store_prd_pembeli_stitch_v1md.md | - | - | - | - | - | 0 | 0 | `-` | `-` | referensi (bukan halaman) | PRD 810 baris; 1 titik tengah + 66 em dash; acuan requirement |

## 9. Referensi desain lain di `docs/design` (bahan, bukan target migrasi)

| Folder | Jumlah file | Isi | Perlakuan |
|---|---|---|---|
| `docs/design/assets` | 76 | 16 cover, 7 event, 38 ilustrasi, 3 banner-hero, 3 banner, logo, 5 kategori buku (png), `assets.json`, 1 md | **read-only**; 41 dipakai prototype -> dipublikasikan ke `public/assets/ikapi/` |
| `docs/design/page-ref` | 5 | 1 screenshot beranda + 4 referensi gaya (Bookstore, Creatibot, Bookoe, Peterdraw) | read-only; bahan desain lama |
| `docs/design/scrape-ref` | 4 | 3 HTML Hostinger + `DESIGN (4).md` | read-only; sumber arah visual Hostinger |
| `docs/design/stitch` | 65 | 31 desktop + 31 mobile + 2 md; 32 file berbeda dari prototype-copy, 1 identik | **read-only, tidak boleh diubah**; arsip mobile lama |
| `docs/spec` | 7 | BPMN AS-IS, BPMN TO-BE, ERD, skema relasi, use case, proposal, dokumen skenario | read-only; acuan requirement bisnis |

Catatan: `docs/design/stitch/user/detail_buku_komentar_evaluasi_desktop.html` dan `user/detail_buku_komentar_evaluasi_mobile.html` hanya ada di arsip stitch (tidak ada padanannya di `prototype-copy`), jadi **bukan** sumber migrasi.

## 10. Cek silang jumlah

| Cek | Hasil |
|---|---|
| `find docs/design/prototype-copy -type f \| wc -l` | 45 |
| Baris pada tabel di dokumen ini | 45 |
| Selisih | **0** |
| `find ... -name "*.html"` | 40 (38 halaman + 2 redirect) |
| `find ... -name "*.js"` | 3 |
| `find ... -name "*.md"` | 2 |
| Halaman yang menggandakan UI | 2 redirect; `user/masuk_login` + `user/daftar_akun` dipakai 2 persona (1 file) |
| Referensi internal rusak | 0 (semua target `.html` ada) |
| Referensi aset rusak | 0 (0 tautan aset hilang, 0 beda huruf besar/kecil) |
| Request jaringan | 0 `fetch`/`XHR`/`axios` |
| Key localStorage | 21 (5 key punya 2 penulis - lihat blueprint bagian 5.2) |
| Email/titik tengah di `<title>` | 31 halaman masih memakai em dash di `<title>`; 1 titik tengah di PRD (baseline defect) |

