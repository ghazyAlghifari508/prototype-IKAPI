# P03 - Fondasi Laravel Blade + Tailwind CSS 4 + Aset

Fase: **fondasi teknis** (bukan konversi halaman). Sumber: `docs/migration/p1-inventory.md`,
`p1-architecture-blueprint.md`, `p2-visual-baseline.md`. Prototype HTML tidak diubah satu byte pun.

## 1. Sumber & lingkungan yang diverifikasi

| Item | Nilai |
|---|---|
| Branch / commit | `prototype-only` @ `f243012` (branch `prototype` tetap tidak ada di lokal/remote) |
| PHP / Composer / Node / npm | 8.4.27 / 2.9.2 / v24.20.0 / 12.0.2 |
| Laravel | 13.42.0 |
| Tailwind | **4.3.5** (`tailwindcss`), `@tailwindcss/vite` 4.3.4, `laravel-vite-plugin` 1.3.0, Vite 6.4.6 |
| Alpine | terpasang 3.17.5, **tidak di-bootstrap** (prototype 0 pemakaian) |
| `@tailwindcss/forms` | terpasang 0.5.11, **plugin tidak diaktifkan** (lihat bagian 5) |
| Breeze | 0 jejak (composer/lock/vendor/kode); `routes/web.php` tanpa route auth |
| Database | tidak disentuh: 0 `migrate`/`seed`/`drop`/`truncate` dijalankan |

Routes terdaftar setelah P03 (`php artisan route:list`): `/` (`home`), `/ui/foundation` (`ui.foundation`),
plus `storage/*` + `up` bawaan framework. **Halaman produk belum didaftarkan** supaya tidak ada kesan sudah selesai.

## 2. Konfigurasi yang dipasang

`resources/css/app.css` (CSS-first, Tailwind 4):

```css
@import 'tailwindcss';
@source '../../resources/views/**/*.blade.php';
@source '../../resources/js/**/*.js';
@source not '../../docs';          /* prototype HTML tidak boleh bocor ke bundel */
@theme { /* token bagian 3 */ }
@layer base { /* kompensasi preflight bagian 4 */ }
@utility focus-ring { ... }  @utility focus-ring-light { ... }
@utility scrollbar-none { ... }  @utility no-print { ... }
```

- Tidak ada `<script src="https://cdn.tailwindcss.com">` dan tidak ada `tailwind.config.js` di aplikasi.
- `@source not '../../docs'` terbukti bekerja: kelas yang hanya ada di prototype (`max-w-[1560px]`) **tidak** masuk bundel, dan ukuran CSS turun dari 124 KB (build lama yang memindai `docs/`) menjadi **19,4 KB**.
- Output build sekarang: `public/build/assets/app-BJ5li5_x.css` 19.381 B, `app-BcPGhxXl.js` 4.563 B.

`vite.config.js`: tidak diubah (`laravel({ input: [css, js] })` + `tailwindcss()`).

`resources/js/app.js`: hanya mengimpor lapisan demo state; Alpine sengaja tidak dipanggil.

## 3. Token desain (dari pengukuran, bukan sistem baru)

Semua nilai diambil dari tabel pengukuran P02 bagian 6 dan inventaris config per halaman P01 bagian 6.1.

| Token (`@theme`) | Nilai | Bukti pemakaian di prototype |
|---|---|---|
| `--color-primary` | `#673de6` | 1.016 token kelas, config 9 varian |
| `--color-primary-hover` | `#5025d1` | tombol hover di seluruh halaman |
| `--color-primary-deep` | `#2f1c6a` | teks judul/footer beberapa halaman |
| `--color-primary-accent` | `#9d99ff` | config buyer (`primary.accent`) |
| `--color-surface(-soft/-neutral)` | `#ffffff` / `#f5f6ff` / `#f5f5f6` | kartu, latar lembut, latar netral |
| `--color-ink-body` / `--color-ink-muted` / `--color-ink-subtle` | `#222225` / `#62636b` / `#9d9ea4` | teks utama/sekunder/tersier |
| `--color-canvas` / `--color-soft` / `--color-neutral` / `--color-muted` / `--color-divider` / `--color-viewer` | `#ffffff` / `#f5f6ff` / `#f5f5f6` / `#62636b` / `#efeff2` / `#f5f5f6` | nama token halaman portal & invoice |
| `--color-border`, `--color-border-subtle`, `--color-border-bold` | `#e5e7eb`, `#e5e7eb`, `#d1d5db` | 735 pemakaian `border` |
| `--color-status-success` / `--color-status-danger` | `#0f7b4f` / `#b42318` | teks status (tanpa bg/border) |
| `--font-sans` | `DM Sans` + fallback sistem | 38 halaman, body 16px |
| `--font-serif` | `Literata` | hanya `preview_buku` + `web_reader` |
| Radius | default v4 sudah cocok: `xl` 12px, `2xl` 16px, `3xl` 24px | pengukuran P02 |

Radii tidak ditimpa karena default Tailwind 4 sudah sama dengan mayoritas prototype
(`rounded-xl` 12px, `rounded-2xl` 16px, `rounded-3xl` 24px pada halaman buyer).

## 4. Kompensasi preflight v4 (dengan bukti pengukuran)

| Perbedaan v3 CDN -> v4 | Kompensasi | Bukti terukur setelah kompensasi |
|---|---|---|
| warna border default `#e5e7eb` -> `currentColor` | `@layer base { *, ::before, ::after { border-color: var(--color-border) } }` | elemen `border` tanpa warna: `rgb(229, 231, 235)` ✓ (prototype sama) |
| placeholder `#9ca3af` -> `currentcolor` | `::placeholder { color:#9ca3af; opacity:1 }` | `getComputedStyle(input,'::placeholder').color` = `rgb(156, 163, 175)` ✓ |
| `cursor: pointer` pada `[role=button]` dihapus | `[role='button'] { cursor: pointer }` | ada di bundel |
| `shadow-sm` lebih tebal di v4 | `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)` | `box-shadow: rgba(0,0,0,0.05) 0 1px 2px 0` ✓ |
| `shadow-xs` tidak ada di v3 (prototype tanpa bayangan) | `--shadow-xs: 0 0 #0000` | `box-shadow: rgba(0,0,0,0) 0 0` ✓ |
| `outline-none` v4 = `outline-style:none` (v3: outline transparan) | **tidak dikompensasi** | secara visual sama-sama menghilangkan outline; prototype selalu menambahkan `focus:ring-*`/`focus-ring`. Dicatat sebagai perbedaan yang disetujui |
| `container` punya arti berbeda | **tidak dikompensasi** | `container` dipakai 2 halaman (beranda, komunitas); saat konversi diganti `max-w-[1360px] mx-auto` sesuai baseline. Dicatat, bukan diperbaiki sekarang |

CSS khusus dipertahankan minimal dan disalin apa adanya dari prototype: `.focus-ring` (outline 2px
`#673DE6`, offset 2px), `.focus-ring-light` (putih), `.scrollbar-none` (`scrollbar-width:none` +
`::-webkit-scrollbar{display:none}`), `.no-print`. CSS khusus besar (variabel tema reader, connector
thread komunitas) sengaja **belum** dipindahkan karena baru terpakai di P06/reader; sumbernya dicatat di
P01 (`theme-*` di `web_reader`, grid avatar rail 36px + elbow 12px di komunitas).

### 4.1 Audit utility yang benar-benar dipakai prototype (agar tidak ada yang tertinggal)

| Pola | Pemakaian | Halaman | Perlakuan di Tailwind 4 |
|---|---|---|---|
| `peer` | 0 | 0 | tidak relevan |
| `group-hover:*` | 130 | 9 | didukung v4 (selector berubah ke `:is(:where(.group):hover ...)`, hasil visual sama) |
| `group-open:*` | 11 | 10 | didukung v4 (`details[open]`) |
| `line-clamp-*` | 83 | 15 | bawaan v4 (tanpa plugin) |
| `truncate` | 81 | 25 | sama |
| `dark:*` | 20 | 1 (`web_reader`) | variant `dark` perlu tetap `class`-based saat halaman itu dikonversi |
| arbitrary values | 4.277 kemunculan (1.120 token unik) | 40 | aman; angka kelas disalin apa adanya |
| `backdrop-blur` / `drop-shadow` | 32 / 16 | - | v4: `backdrop-blur-xs` tersedia (dipakai 5 halaman); `shadow-xs` sudah dikompensasi (bagian 4) |

Referensi resmi: snapshot dokumentasi Tailwind 4 pada skill belum di-initialize, sehingga verifikasi
dilakukan terhadap **paket Tailwind 4.3.5 yang terpasang** (kompilasi nyata + pembacaan `node_modules/tailwindcss`) dan
`references/gotchas.md` dari skill. Setiap klaim di tabel di atas diuji dengan build nyata, bukan asumsi.

## 5. Perubahan dependency/perilaku yang perlu keputusan

| # | Perubahan | Alasan | Status |
|---|---|---|---|
| K1 | `@plugin "@tailwindcss/forms"` dihapus dari `app.css` | Prototype memakai Tailwind 3 CDN **tanpa** plugin forms; plugin akan mengubah tampilan input/select di semua halaman. Dependency tetap terpasang. | Perlu konfirmasi pemilik; hapus dependency-nya sekalian bila setuju |
| K2 | Alpine tidak di-bootstrap | 0 atribut Alpine di 40 halaman prototype | Perlu konfirmasi; dependency tetap ada |
| K3 | `--shadow-xs` dinolkan | Menjaga paritas dengan golden PNG P02 (prototype tidak menampilkan bayangan) | Perlu konfirmasi bila ingin bayangan v4 |
| K4 | `tests/Pest.php` + `routes/web.php` dinormalkan ke LF | `.gitattributes` menetapkan `eol=lf`; `pint --test` gagal `line_ending` pada kedua berkas | Sudah dilakukan (tanpa perubahan isi); `pint` kini **passed** |
| K5 | Web font masih dari Google Fonts CDN | Sama seperti prototype sehingga metrik font identik; self-hosting belum diperlukan | Perlu keputusan sebelum produksi |
| K6 | `.env` lokal: `SESSION_DRIVER`/`CACHE_STORE` -> `file`, `QUEUE_CONNECTION` -> `sync` (secret & kredensial DB tidak diubah) | `.env.example` sudah file/sync sejak pembersihan Breeze, tetapi `.env` pengembang masih `database` sehingga `GET /ui/foundation` mengembalikan **HTTP 500** (query `sessions` ke MySQL yang tidak jalan). Tanpa mengubah secret, driver lokal disetel ke file/sync | Sudah dilakukan; backup di `/tmp/env.backup`; `/` dan `/ui/foundation` kini 200 tanpa override env. `DB_CONNECTION=mysql` tetap |

## 6. Aset

- **76 berkas** disalin byte-identik dari `docs/design/assets` ke `public/assets/ikapi` (**23,6 MB**),
  struktur folder dipertahankan (`covers/`, `events/`, `banner-hero/`, `banners/`, `ilustration/`, logo, 5 kategori).
- Verifikasi: **76/76 md5 identik**, **76/76 URL mengembalikan HTTP 200** dengan ukuran byte sama,
  dimensi (PNG/JPEG/SVG) tercatat. Mapping lengkap + hash per berkas: `docs/migration/p3-assets.json`.
- **Tidak ada berkas yang diganti nama**; 21 berkas berspasi/huruf besar dipertahankan apa adanya dan
  wajib dipanggil lewat `asset()` agar ter-encode (contoh `assets/ikapi/banner-hero/Dari Penerbit Jawa Barat.png`).
- Ilustrasi khusus dipertahankan: `komunitasil.png`, `komunitasil_transparent.png`, `notfoundil.png`,
  `auth_login.png`, `auth_register_reading.png`, `hero_reading.png`, logo, cover, dan foto event.
- **Tidak ada aset hilang**: 0 referensi `../../assets/...` yang tidak ada di sumber (audit P01/P02).
- Aset yang belum dipakai halaman mana pun (35 berkas, mis. ikon 3D dan 8 SVG ilustrasi) tetap disalin
  supaya fase berikutnya tidak menemukan aset hilang - keputusan pemilik bila ingin membuang.

## 7. Fixture & konvensi state

Format fixture: **JSON per entitas** di `resources/data/ikapi/`, dibaca lewat `App\Support\Fixtures`
(`Fixtures::books()`, `::communities()`, `::orders()`, `::users()`), tanpa tabel DB dan tanpa menyalin data ke setiap Blade.

| Fixture | Item | Sumber ekstraksi (prototype) | Catatan |
|---|---|---|---|
| `books.json` | 12 | `rawCatalogBooks` di `user/katalog_buku_desktop.html` | field asli: id, title, author, category, publisher, price, cover, year, detailUrl |
| `communities.json` | 3 | `communitiesData` di `user/komunitas_literasi_desktop.html` | termasuk `photoAlt`, `focusPoints`, `status` |
| `orders.json` | 5 | `ordersData` di `user/riwayat_pesanan_desktop.html` | status/statusLabel/paymentMethod/books |
| `users.json` | 4 | array `BASE_USERS` di `admin/kelola_pengguna_desktop.html` | key, reg, role, pj, ikapi, registration, account |

Ekstraksi dijalankan oleh `docs/migration/tools/extract-fixtures.mjs` (membaca nilai asli dari halaman;
tidak ada data atau statistik baru yang diciptakan). Fixture lain (agenda, FAQ, ulasan, pencairan, laporan)
belum diekstrak dan akan diambil dengan skrip yang sama saat fasenya tiba.

Browser state (`resources/js/ikapi/demo/`):

| Modul | Isi |
|---|---|
| `state.js` | registry **21 kunci `ikapi_*`** (nama identik dengan prototype), `read/write/remove`, `ensureSeed(name, version, factory)` untuk migrasi seed berversi, `clearAll()`, fallback in-memory bila localStorage diblokir |
| `session.js` | sesi demo buyer/admin, `publisherApplication()`, `publisherPortalBlocked()`, `adminPortalBlocked()`, `idParam()` + `isValidId()`, `safeNext()` (menerima `perpustakaan_saya_desktop.html?tab=reading`, menolak `https://example.com/x`), `showMissingState()` |
| `notice.js` | renderer notifikasi demo; semua varian memakai **kelas literal lengkap** (tidak ada perangkaian runtime) |

`app/Support/Navigation.php` menyediakan helper navigasi reusable: `Navigation::items($persona)`
mengembalikan label + ikon (diambil dari menu prototype di P01) beserta `ready` (`Route::has()`)
dan `active` (`request()->routeIs()`). Item yang rutenya belum terdaftar dilaporkan
`ready = false`, sehingga halaman tidak pernah menautkan ke rute kosong; di halaman uji, 21 item
tertulis "belum ada" dan hanya `home` yang berstatus aktif.

Aturan yang ditetapkan: fixture = data awal yang read-only; semua yang mutable (sesi, profil, rating,
laporan, keanggotaan, posisi baca) hanya lewat empat modul di atas, sehingga halaman tidak pernah
memanggil `localStorage` langsung.

## 8. Bukti pipeline (smoke test terisolasi)

Rute: `GET /ui/foundation` (`ui.foundation`), view `resources/views/foundation.blade.php`.
Halaman ini menampilkan token, parity preflight, sampel 4 aset publik, kartu buku dari fixture, dan
widget demo state. Bukan halaman produk dan tidak ditautkan dari navigasi apa pun.

Perintah: `php artisan serve --host=127.0.0.1 --port=<port>` (tanpa override env - lihat bagian 5 K6),
lalu `P3_BASE=http://127.0.0.1:<port> node docs/migration/tools/verify-foundation.mjs`; skrip mengukur
ulang semuanya, bukan asumsi. Screenshot bukti: `docs/migration/baselines/foundation/1440x900.png`,
`390x844.png`, `1440x900-notice.png`. Data mentah: `docs/migration/p3-verification.json`
(berisi `base` URL yang dipakai saat verifikasi).

| Pemeriksaan | Hasil | Status |
|---|---|---|
| `php artisan route:list` | 5 route (`/`, `/ui/foundation`, `storage/*`, `up`) tanpa auth Breeze | lulus |
| `php artisan view:cache` | "Blade templates cached successfully" | lulus |
| `npm run build` | sukses; CSS 19.381 B, JS 4.563 B | lulus |
| `phpstan analyse` (level 7) | 0 error | lulus |
| `pint --test` | passed (setelah K4) | lulus |
| Muat halaman di browser | HTTP 200, **0 error JS/console**, **0 response non-200** | lulus |
| Font | `document.fonts.status = loaded`; DM Sans ✓, Material Symbols ✓, Literata terdaftar | lulus |
| Body | `DM Sans` 16px, `rgb(34,34,37)`, latar `rgb(255,255,255)`, line-height 24px = **identik** dengan pengukuran prototype | lulus |
| H1 | 34px / line-height 42.5px / weight 700 = **identik** dengan `katalog_buku_desktop.html` @1440 | lulus |
| Token warna | `--color-primary: #673de6`, `--color-ink-body: #222225`, `--color-border: #e5e7eb`; swatch `rgb(103,61,230)` | lulus |
| Aset lewat origin aplikasi | 76/76 HTTP 200, ukuran byte sama dengan sumber | lulus |
| Cakupan kelas dari JS | kelas yang hanya ada di `resources/js` (`text-status-success`, `text-status-danger`, `bottom-6`, `z-50`, `left-1/2`, `-translate-x-1/2`) ada di bundel | lulus |
| Notice render | `position: fixed`, `z-index: 50`, `box-shadow rgba(0,0,0,0.05) 0 1px 2px`, ikon `rgb(15,123,79)` | lulus |
| Demo state | 21 kunci terdaftar (19 mutable); tulis sesi buyer -> guard admin jadi `blokir` (sesuai `admin-guard.js`); `safeNext` menolak URL eksternal; `isValidId('../../etc/passwd')` = false | lulus |
| `.env` lokal tanpa DB | `/` = 200 dan `/ui/foundation` = 200 dengan `php artisan serve` biasa (tanpa override env, tanpa tabel database) | lulus |
| Navigation helper | 3 persona dirender, 21 item berstatus "belum ada" (rute belum terdaftar), `home` berstatus siap; `route('ui.foundation')` menghasilkan URL absolut | lulus |

## 9. Perbedaan yang diketahui vs prototype (dicatat, tidak disembunyikan)

1. **`shadow-xs`**: prototype (v3 CDN) tidak merender bayangan; v4 akan merender `0 1px 2px`. Shim `--shadow-xs: 0 0 #0000` menjaga paritas golden PNG; hapus shim bila pemilik ingin bayangan v4 (18 halaman terdampak).
2. **`rounded-3xl` pada 1 halaman portal**: config admin/penerbit memakai 20px, sedangkan default v4 dan 50 pemakaian halaman user memakai 24px. Satu pemakaian di halaman portal akan berbeda 4px kecuali ditangani khusus saat konversi halaman itu.
3. **`container`**: 2 halaman memakai utility `container` v3 (center + padding). Akan diganti `max-w-[1360px] mx-auto` saat konversi; tidak dibuat utility global baru.
4. **`@tailwindcss/forms` tidak aktif**: input di Blade memakai gaya default browser + utility, persis seperti prototype. Bila plugin diaktifkan nanti, seluruh input akan bergeser - wajib dibandingkan ke golden PNG.
5. **Web font via CDN**: DM Sans/Literata/Material Symbols dimuat dari Google Fonts seperti prototype. Baseline direkam dengan jaringan aktif; tanpa jaringan, metrik font berbeda.
6. **Em dash `<title>`** di 31 halaman prototype tetap ada (baseline defect D8 P02); Blade yang dikonversi nanti sebaiknya memakai pemisah yang sama agar tidak menimbulkan perbedaan tak terjelaskan.
7. **`docs/design/stitch` hilang** (aksi di luar sesi; lihat P02 bagian 12) dan `docs/design/prototype-copy.zip` (untracked) dibiarkan sesuai instruksi pemilik. Tidak memengaruhi fondasi: golden PNG hanya berasal dari `prototype-copy` + `assets`.

## 10. Gate P03 dan serah terima ke P04

**Gate: "Vite CSS harus merender token referensi dengan benar sebelum P04" -> LULUS.**
Bukti: token terukur di browser (`#673de6`, `#222225`, `#e5e7eb`), tipografi identik dengan prototype
(16px/24px body, 34px/42.5px H1), parity preflight terverifikasi (border, placeholder, shadow, cursor),
76/76 aset 200 byte-identik, 0 error runtime, dan bundel tidak memuat kelas prototype.

Untuk P04 (fondasi layout/komponen atau konversi halaman pertama):

1. Pindahkan pola layout dari P02 blueprint ke Blade **hanya saat halamannya dikonversi**; jangan membuat shell kosong untuk semua peran sekaligus.
2. Setiap halaman baru wajib dibandingkan ke golden PNG P02 pada viewport yang sama (`docs/migration/baselines/<persona>/<halaman>/`), dengan overlay dari `tools/imagediff.mjs --threshold=0`.
3. Guard portal (penerbit/admin) dipindahkan ke middleware pada fase portal; aturan & pesan sudah didefinisikan di `resources/js/ikapi/demo/session.js` dan `p3-foundation.md`.
4. Fixture yang belum diekstrak (agenda, FAQ, ulasan, pencairan, laporan) diambil dengan `tools/extract-fixtures.mjs` saat fase terkait dimulai - jangan menulis data baru.
5. Keputusan K1-K5 pada bagian 5 sebaiknya dijawab sebelum P05 (konversi halaman beranda) karena menyentuh tampilan input, font, dan bayangan.
