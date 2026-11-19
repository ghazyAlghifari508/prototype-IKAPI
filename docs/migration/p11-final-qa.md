# P11 — Final browser QA, screenshot diff, regression fixes, completion report

Fase penutup. Isinya bukti, bukan klaim: setiap angka di bawah berasal dari skrip di `docs/migration/tools/`
yang bisa dijalankan ulang, dan setiap kegagalan yang diperbaiki punya bukti sebelum/sesudah.

## 1. Lingkungan dan sumber

| Item | Nilai |
|---|---|
| Repository | `ghazyAlghifari508/prototype-IKAPI` |
| Branch aktif | **`prototype-only`** @ `f243012` (branch `prototype` tidak ada di remote maupun lokal; tidak dibuat, tidak beralih ke `main` yang berisi React/Inertia) |
| Working tree | 82 berkas tracked termodifikasi + 21 untracked (tools/report/fixture P01–P11), **tidak di-commit** (tidak ada commit/push/merge/deploy) |
| PHP / Laravel | PHP 8.4.27 (ZTS, Laragon) / Laravel 13.42.0 |
| Node / build | Node v24.20.0, Vite 6.4.6, Tailwind 4.3.5 |
| Browser uji | Playwright Chromium `chromium-1255` (HeadlessChrome 159.0.8154.6) |
| App origin | `http://127.0.0.1:8140` (`php artisan serve`) |
| Prototype origin | `http://127.0.0.1:8099/prototype-copy/...` (`python -m http.server`, disajikan apa adanya) |
| Viewport | 1440×900, 1366×768, 768×1024, 390×844, 320×700; DPR 1; locale `id-ID`; TZ `Asia/Jakarta`; `prefers-reduced-motion: reduce`; color-scheme light |
| Font | DM Sans, Literata, Material Symbols, Plus Jakarta Sans dari Google Fonts. CDN bisa menggantung (cacat sumber D6), jadi setiap capture memuat tiap face secara eksplisit dan hanya memotret bila `document.fonts.check()` benar untuk ketiganya |

Aturan repo: `AGENTS.md` tidak ada di repo ini; `docs/HANDOFF_SESSION.md` dan laporan P01–P10 dibaca ulang sebagai
kontrak. `docs/design/prototype-copy` dan `docs/design/assets` **tidak diubah** (lihat §7).

## 2. Cakupan migrasi

- **40 berkas HTML kanonis** di `docs/design/prototype-copy/{user,penerbit,admin}`.
- **2 di antaranya adalah halaman stub pengalihan**, bukan desain: `penerbit/masuk_portal_penerbit_desktop.html` dan
  `penerbit/pendaftaran_penerbit_desktop.html` berisi teks "Halaman autentikasi penerbit lama sudah disatukan. Anda
  diarahkan ke halaman Masuk/Pendaftaran terpadu". Keduanya dipetakan ke alias 302 (§4), bukan ke view sendiri.
- **38 desain kanonis** → **45 page-state** yang dirender (1 berkas `komunitas_literasi_desktop.html` menghasilkan 5
  state: direktori, profil, ruang, topik, balas).
- **Rute**: 43 rute halaman (42 + `/`), 2 rute alias 302, 6 rute bukti `ui/*`, 0 rute mati. Total `GET` = 52
  (`php artisan route:list`).
- **View**: 78 berkas Blade = 42 page view + 6 layout (`public`, `auth`, `plain`, `portal`, `publisher`, `admin`) + 5 komponen (`ikapi/{book-card,form-field,head,modal,toast}`)
  + 18 partial + `errors/404`.
- **Aset**: 76 berkas di `public/assets/ikapi` (23 MB), md5 identik dengan `docs/design/assets`.
- **Data**: 17 fixture di `resources/data/ikapi` (satu dataset, tidak ada duplikasi).

Matriks per halaman (sumber, rute, 5 viewport, diff terburuk, ukuran, error, gambar rusak, status) ada di
`docs/migration/p11-matrix.md` (+ mesin `p11-matrix.json`, 45 baris). Semua sumber kanonis punya target; tidak ada
sumber tanpa tujuan dan tidak ada rute halaman tanpa sumber.

## 3. Bukti visual (screenshot diff)

Metode: setiap halaman/state dipotret **dua kali dalam konteks browser baru** (Blade dan HTML asli pada state yang
sama), full-page, dengan font dipaksa termuat dan caret disembunyikan. Perbandingan piksel memakai `imagediff.mjs`
(ambang 0, tanpa toleransi) sehingga perbedaan 1 level pun terhitung; klasifikasi baru dibuat setelah itu, bukan
dengan menaikkan ambang.

Ringkasan (detail penuh di `p11-matrix.md`):

| Kelompok | Hasil |
|---|---|
| 20 dari 45 page-state | **0 piksel sama sekali** di kelima viewport |
| 23 page-state | 0,002%–0,48% (sisa rasterisasi: bayangan, tepi border subpiksel, `backdrop-blur`, resampling sampul) |
| agenda | 0,62%–0,84%: **hanya** badge tanggal `backdrop-blur-xs` (lihat §6 EX-2) |
| detail buku | tinggi −40/−40/−63/−108/−131 px karena markup referensi sendiri rusak (EX-1) |
| Gambar rusak (`<img src="">`) | jumlah **sama di kedua sisi** di setiap halaman (1–2 per halaman) |
| Tinggi halaman | identik di 44 dari 45 page-state; hanya detail yang berbeda (EX-1) |
| Error JS saat capture | 0 di semua halaman, kedua sisi |

Bukti bahwa sisa piksel bukan kesalahan layout: `p11-geometry.mjs` membandingkan **bounding box setiap elemen yang
tampil** (x, y, w, h sampai 0,01 px, dipasangkan per tanda tangan tag#id|class, bukan per urutan) pada 17
halaman/viewport. Hasil:

- **9 halaman portal** (penerbit 4 + admin 5), onboarding, dan login: **0 node hilang, 0 selisih kotak, 0 selisih
  kata**.
- Halaman lain: node yang "hilang" hanya elemen tambahan di header (`ikapi-cart-badge`, pembungkus tautan nav),
  tidak menggeser elemen lain.
- Selisih kotak terbesar di seluruh 17 perbandingan: **0,04 px** (pill `span` di tabel pengguna admin, lebar
  persentase), 1 px tepi kartu di `/lupa-kata-sandi` @320.
- Teks identik di semua halaman (perbandingan multiset kata) kecuali `/lupa-kata-sandi` @320: prototipe membawa teks
  toast bawaan "Permintaan berhasil diproses" + `check_circle` di DOM yang tersembunyi, sedangkan komponen toast kita
  kosong sampai dipakai. Tidak terlihat dan tidak mengubah piksel (lihat §9 CAT-1).

Screenshot tersimpan: `docs/migration/baselines/p5|p6|p7|p8|p9/<state>/<viewport>-{blade,proto,diff}.png`
(894 berkas untuk 5 viewport; halaman dengan ukuran berbeda tidak menghasilkan diff, hanya blade+proto).


### Gaya terhitung (computed style) dan invarian konten

`p11-styles.mjs` membandingkan `font-family/size/weight/line-height/letter-spacing/color/background/
border-radius/box-shadow/padding/margin/text-transform` pada 37 elemen perwakilan di 8 halaman. Hasil:

- **0 selisih** untuk invoice dan direktori komunitas; seluruh halaman lain hanya berbeda pada dua hal yang tidak
  mengubah piksel: (a) `box-shadow` header memakai 5 lapis Tailwind 4 vs 3 lapis Tailwind 3 pada sumber, dengan dua
  lapis tambahan **transparan** (`rgba(0,0,0,0)`) dan lapis terakhir identik, sehingga diff piksel header = 0;
  (b) tumpukan fallback font setelah `"DM Sans"` berbeda antar-keluarga halaman **di dalam prototipe sendiri**
  (halaman user: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`; penerbit/admin: `system-ui`), sementara font
  utama identik. Token aplikasi memakai tumpukan `tailwind.config` sumber (`"DM Sans", sans-serif`) - tumpukan
  fallback lain tidak diseragamkan agar tidak mengubah halaman yang sudah cocok.
- Invarian: pembaca e-book **0 kontrol unduh** dan 0 tautan berkas (tidak ada `.pdf`/`download`); hero komunitas
  memakai ilustrasi yang sama dengan sumber (`komunitasil.png`, alt identik), ilustrasi `room-empty` memakai
  `community_reading.svg` persis seperti sumber.

## 4. Rute, alias, dan kegagalan aman

| Kasus | Bukti |
|---|---|
| `/penerbit/masuk` | 302 → `/masuk?role=publisher` (prototipe memang stub pengalihan) |
| `/penerbit/daftar` | 302 → `/daftar?role=publisher` |
| `/buku/tidak-ada` | 404 halaman 404 aplikasi (bukan fallback ke buku pertama) |
| `/komunitas/tidak-ada` | 404 |
| `/komunitas/{c}/diskusi/TPC-TIDAK-ADA` | 200 + state "topik tidak tersedia" |
| `/komunitas/{c}/diskusi/{t}/balas/RPL-TIDAK-ADA` | 200 + "komentar induk tidak tersedia" |
| Tautan `href="*.html"` di Blade | **0** (audit ulang seluruh `resources/views`) |
| Tautan `cdn.tailwindcss.com` di Blade/JS | **0** (prototipe memuatnya di 40/40 berkas: cacat sumber D6) |
| `{{ }}` / `@vite(` yang bocor ke HTML | 0 |
| Karakter `breeze` di app/routes/resources/config/database/tests | 0 |

Semua URL internal memakai named route; tidak ada URL relatif terhadap berkas `.html`.

## 5. Matriks pengujian fungsional

Semua skrip dijalankan ulang pada build terakhir. `PASS` berarti dijalankan dan diverifikasi di browser, bukan
"seharusnya jalan".

| Suite | Cakupan | Hasil |
|---|---|---|
| `p11-audit.mjs` (86 baris = 43 rute × 2 viewport) | status, console, request gagal, ID duplikat, overflow-X, gambar tanpa alt, kontrol tanpa nama, `aria-current`, string terlarang | **PASS** 86/86, 0 temuan. Pembanding: prototipe 86/86 punya `cdn.tailwindcss.com` (D6) |
| `p11-handlers.mjs` (42 rute, 330 inline handler) | setiap `onclick/onchange/onsubmit/oninput/onkeydown` harus menunjuk fungsi yang ada di `window` | **PASS** setelah perbaikan QA-11-1 (sebelumnya 5 fungsi widget tidak ada) |
| `p11-nav.mjs` | header responsif 390 (4 tautan, tinggi 113 sama dengan sumber), katalog cari 12→2 + reset, filter+sort+empty state, tambah keranjang (badge 2→3), tautan footer, chatbot, izin ruang komunitas | **PASS** 7/7, 0 error JS |
| `p5-interactions.mjs` | 4 halaman inti + 404, reload stabil | **PASS** 9/9 |
| `p6-interactions.mjs` | login/daftar/lupa/verifikasi/onboarding/status, akun, bantuan, keranjang, pesanan, perpustakaan, reader, ulasan, agenda, agenda-detail, chatbot | **PASS** 18/18, 0 error |
| `p6-a11y.mjs` | Enter submit, urutan Tab, focus ring, validasi kosong, Escape modal, Back, persistensi reload (profil, posisi reader, keranjang) | **PASS** 9/9 |
| `p7-flows.mjs` | direktori→cari→profil→gabung→ruang→buat topik→balas akar/anak, hierarki, izin, laporan, hapus induk (anak hidup), indentasi dalam, 320/390 | **PASS** 6/6 |
| `p8-flows.mjs` | navigasi+reload, shell 390, kelola buku, pencairan simulasi, ulasan, pengaturan, alias + status + invoice | **PASS** 7/7 |
| `p9-flows.mjs` | shell+navigasi, pengguna, katalog, moderasi ulasan, monitoring, pencairan, komunitas, moderasi diskusi, login admin | **PASS** 9/9; 1 error JS = cacat sumber D-09-1 (`editable is not defined`) yang **reproduksi di kedua sisi** |
| `p10-flows.mjs` | 7 alur lintas peran (belanja→baca, pengajuan→approval, buku→katalog, ulasan→moderasi, komunitas→moderasi, pencairan→admin, refresh/back/deep-link/peran/ID invalid) | **PASS** 7/7. 2 entri console 404 = uji ID invalid yang memang harus 404 |
| `p10-failures.mjs` | store kosong, JSON rusak (11 key), storage diblokir, flag peran bertabrakan, double submit | **PASS** 5/5 |
| `p11-geometry.mjs` | 17 perbandingan box/kata | **PASS** (lihat §3) |

Gerbang runtime: `composer validate` valid · `php artisan route:list` 52 GET · `php artisan view:cache` sukses
(139 view ter-cache) · `npm run build` sukses · `phpstan` 0 error · `pint --test` bersih · tidak ada
`migrate/seed/drop/truncate` yang dijalankan.

## 6. Defect yang ditemukan dan diperbaiki di fase ini

| # | Prioritas | Gejala | Akar masalah | Perbaikan | Retest |
|---|---|---|---|---|---|
| QA-11-1 | **P1** | Tombol chatbot melayang di beranda, katalog, agenda, detail agenda, komunitas: diklik tidak membuka apa pun (inline handler `toggleWidgetPanel is not defined`) | Modul Vite bersifat scoped; markup widget mempertahankan `onclick` dari prototipe tetapi 5 fungsinya tidak pernah dipublikasikan ke `window` | `resources/js/ikapi/buyer/chatbot-widget.js`: `Object.assign(window, { toggleWidgetPanel, resetChatConversation, handleQuickPrompt, handleChatSubmit, handleTextareaKeydown })` | Widget buka/tutup/Escape/balasan diuji di 5 halaman: semua benar, 0 error; `p11-handlers.mjs` 330 handler, 0 mati |
| QA-11-2 | P2 | `/komunitas` punya **ID ganda** `view-noresults` dan `view-empty` (HTML tidak valid; `getElementById` hanya mengembalikan yang pertama) | Ekstraktor menyimpan blok kosong/no-results dua kali (di dalam dan di luar `<section>`) | Hapus pasangan duplikat di `buyer/community/index.blade.php` (blok identik, keduanya `hidden`) | Jumlah ID unik sekarang 1 per halaman; parity P07 tetap **0** di 5 viewport |
| QA-11-3 | Metode | Parity run bisa berhenti karena `load` menggantung di CDN font | `waitUntil: 'load'` menunggu woff2 dari `fonts.gstatic.com` yang kadang menggantung | Parity tools: fallback ke `domcontentloaded` + gerbang font eksplisit (3 percobaan, reload) | 225/225 baris parity selesai; tinggi halaman identik di semua halaman kecuali detail (EX-1) |
| QA-11-5 | - | Sempat dicurigai ilustrasi state kosong komunitas berbeda | Pemeriksaan DOM kedua sisi: `view-empty` memang `notfoundil.png`, `room-empty` memang `community_reading.svg` | Tidak ada perubahan kode (percobaan di-revert); parity P07 tetap 0 | 
| QA-11-4 | P3 (dokumen) | Laporan P06 menulis agenda 0,08–0,11%; pengukuran ulang 0,62–0,84% | Salah desimal di laporan fase | Dikoreksi di sini + dijelaskan (EX-2) | `p6-parity.json` baris agenda: 0,0062–0,0084 |

Perbaikan dari fase sebelumnya yang diverifikasi ulang tetap berlaku: guard modul unik per halaman (0 tabrakan
guard-vs-halaman), `@stack('overlays')` di semua layout, `divide-y` arah v3, `th/td { padding: 1px }`, palet v3,
`data-*` → `asset()`, shim router SPA.

## 7. Audit integritas sumber dan data

| Pemeriksaan | Hasil |
|---|---|
| `git status docs/design/prototype-copy` | **0** perubahan |
| `git status docs/design/assets` | **0** perubahan |
| Hash gabungan 40 HTML kanonis (urut nama) | `sha256 73d36c42a147a1f9f21038c5f6582c54c62901e42f2d25c38f57c9b257414c80` |
| Berkas di `docs/design/prototype-copy` | 45 berkas (40 HTML + guard/script), tidak ada yang dipindah/diformat ulang |
| Aset | 76 berkas, md5 identik dengan salinan di `public/assets/ikapi` |
| `docs/design/stitch/**` | 65 berkas **terhapus sebelum fase ini** (keputusan pemilik; arsip read-only). Bukan akibat P11 dan tidak dipulihkan |
| `docs/design/prototype-copy.zip` | tetap ada, tidak dihapus (permintaan pemilik) |

Audit "tidak menyentuh backend": `app/Models/User.php` adalah model default Laravel (tidak dipakai rute mana pun),
`database/migrations` hanya 3 migrasi default, tidak ada `DB::` selain `DB::prohibitDestructiveCommands` di
`AppServiceProvider` (pengaman, bukan query), tidak ada Eloquent di controller, tidak ada middleware auth, tidak ada
Midtrans/webhook/PDF server/email. Semua controller hanya mengembalikan view + fixture JSON.

## 8. Cacat bawaan prototipe vs regresi migrasi

**Regresi migrasi: 0 yang tersisa** (QA-11-1 dan QA-11-2 sudah diperbaiki dan diuji ulang).

Cacat yang **sudah ada di prototipe** dan sengaja dipertahankan (dokumentasi lengkap di laporan fase):

| Kode | Cacat | Status |
|---|---|---|
| D1 | `editable is not defined` pada finalisasi pencairan admin | Dipertahankan; **reproduksi di kedua sisi** (P09 flow 6, `p9-flows.json`) |
| D3/D-08-6 | `invoice` 340 px pada viewport 320 (overflow 20 px) | Dipertahankan; kedua sisi 340 px |
| D4/D-07-4/D-08-2/D-09-2 | `<img src="">` sebagai placeholder | Dipertahankan; jumlah sama di kedua sisi |
| D5 | Guard demo lintas sesi | Sama seperti sumber |
| D6 | Ketergantungan CDN Tailwind + font | Tailwind tidak dipakai (diganti build Tailwind 4); **font tetap CDN** seperti sumber |
| D7/D-06-4/D-07-3/D-09-7 | Panel QA demo tampil di halaman | Dipertahankan |
| D8/D-06-2 | em dash di `<title>` | Dipertahankan (isi prototipe) |
| D-05-1 | Struktur ulasan ke-3 rusak di sumber (lihat EX-1) | Tidak ditiru (markup Blade valid) |
| D-05-5 | Pagination tidak berpindah halaman | Dipertahankan |
| D-06-1 | `hideBanner` ReferenceError | Diperbaiki dengan mempublikasikan fungsi (bukan mengubah perilaku) |
| D-09-5 | Pemilih periode monitoring hanya satu opsi | Dipertahankan |

## 9. Pengecualian yang butuh keputusan pemilik

| Kode | Selisih | Bukti | Mengapa tidak "diperbaiki" |
|---|---|---|---|
| **EX-1** | `/buku/{slug}` lebih pendek 40 px (1440/1366), 63 px (768), 108 px (390), 131 px (320) daripada HTML asli | `p11-matrix.json`; probe DOM: `#reviews-list-container` = 3 `<article>` + 1 `<p>` di sumber, 3 `<article>` di Blade; container 387,00 px vs 347,25 px | Perbedaan berasal dari markup sumber yang tidak valid (body ulasan ke-3 di luar `<article>`). Menyalinnya berarti menyalin HTML rusak. Section 0/1/3, kartu terkait, teks, dan gaya identik |
| **EX-2** | `/agenda` 0,62–0,84% piksel | `baselines/p6/agenda/*-diff.png`; semua titik diff berada di badge tanggal `bg-[#222225]/85 backdrop-blur-xs` (kelas identik di kedua sisi); box dan kata identik | `backdrop-filter` diambil GPU dan hasil sampling-nya tidak deterministik. Prototipe sendiri mengubah tinggi halaman antar-muat (4574 vs 4686 px pada probe), jadi ambang besar akan menyembunyikan cacat lain |
| **EX-3** | Sisa ≤0,48% pada 23 halaman (bayangan, tepi border, tepi sampul hasil kompresi) | `p11-geometry.json`: 0 selisih box/kata pada halaman-halaman tersebut | Rasterisasi, bukan layout. Kalau pemilik ingin nol mutlak, perlu keputusan desain (mis. mengganti `backdrop-blur`), bukan perubahan migrasi |

| **CAT-1** | Teks toast bawaan di `/lupa-kata-sandi` @320 (4 kata) | `p11-geometry.json`: `textWordDiffs: 4` | Toast tersembunyi (`opacity-0`, `pointer-events-none`); prototipe menaruh contoh pesan di DOM, komponen kita mengisinya saat dipakai. Tidak ada dampak visual; menyalin teks contoh akan membuat toast kosong menampilkan pesan palsu |

Status akhir: **PASS** untuk kriteria "tidak ada cacat yang diperkenalkan migrasi", dengan 3 pengecualian
terdokumentasi di atas yang **butuh persetujuan pemilik**. Jika pemilik menuntut kesamaan piksel mutlak termasuk
markup rusak dan `backdrop-blur`, statusnya menjadi PARTIAL dan pekerjaan lanjutannya adalah keputusan desain, bukan
migrasi.

## 10. Batasan frontend-only (dinyatakan, bukan disembunyikan)

- Tidak ada autentikasi nyata, peran, atau middleware: login/daftar/status penerbit adalah simulasi UI di
  `localStorage`, dan dapat diubah pengguna.
- Tidak ada database, Eloquent, migrasi yang dijalankan, atau penulisan server.
- Tidak ada pembayaran: metode, status, dan "berhasil" adalah animasi demo; tidak ada Midtrans/webhook.
- Tidak ada email/OTP, PDF server, atau API bisnis.
- State lintas halaman hanya konsisten di satu origin + satu tab; tidak ada listener `storage`.
- Badge keranjang adalah penghitung demo (2→3 saat menambah) sementara markup keranjang tetap 2 baris; ulasan detail
  (`ikapi_rating_*`) tidak muncul di riwayat ulasan; pencairan penerbit tidak mengubah antrean admin (batasan P10 §7).
- `admin-guard.js` tidak dipasang (alasan di P02/P08/P09).

## 11. Berkas bukti

| Berkas | Isi |
|---|---|
| `p11-final-qa.md` | laporan ini |
| `p11-matrix.md` / `p11-matrix.json` | matriks cakupan 45 page-state × 5 viewport |
| `p11-audit-app.json` / `p11-audit-proto.json` | audit runtime kedua sisi (86 baris masing-masing) |
| `p11-handlers.json` | 42 rute, 330 inline handler, 0 mati |
| `p11-nav.json` | header, pencarian, filter, keranjang, footer, chatbot, izin ruang |
| `p11-geometry.json` | bukti box/kata identik pada halaman yang masih berdiff |
| `p11-styles.json` | perbandingan computed style 37 elemen + invarian reader/hero |
| `baselines/p5|p6|p7|p8|p9/**` | screenshot blade/proto/diff |
| `p5|p6|p7|p8|p9-parity.json`, `p6-a11y.json`, `p7|p8|p9-flows.json`, `p10-flows.json`, `p10-failures.json`, `p10-inventory.json` | hasil uji per fase (dijalankan ulang di P11) |

## 12. Langkah berikutnya (opsional, butuh persetujuan)

1. Putuskan EX-1: terima perbedaan 40–131 px (markup Blade valid) atau minta markup ulasan disusun ulang di sumber.
2. Putuskan EX-2: hapus `backdrop-blur-xs` pada badge tanggal di kedua sisi agar nol mutlak, atau terima.
3. Bila ingin demo lintas tab: tambahkan listener `storage` (penambahan fitur, bukan migrasi).
4. Commit/push hanya atas instruksi eksplisit; saat ini seluruh pekerjaan P01–P11 belum di-commit.