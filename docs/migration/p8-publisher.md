# P08 — Portal Penerbit (frontend-only)

Sumber: `docs/design/prototype-copy/penerbit/*.html` (7 halaman desain + 2 alias redirect + `access-guard.js`).
Prototype **tidak diubah** (`git status docs/design/prototype-copy` = 0, `docs/design/assets` = 0).
Bukti: `p8-parity.json` + `baselines/p8/**` (screenshot+diff 4 viewport), `p8-flows.json` (7 skenario),
`p8-source/**` (fragmen verbatim per halaman), `resources/data/ikapi/publisher.json` (fixture demo).

## 1. Peta berkas sumber → view → route

| # | Sumber (`penerbit/`) | Baris | View Blade | Route (name) |
|---|---|---|---|---|
| 1 | `dashboard_penerbit_desktop.html` | 703 | `publisher/dashboard.blade.php` | `GET /penerbit` (`publisher.dashboard`) |
| 2 | `kelola_buku_desktop.html` | 1088 | `publisher/books.blade.php` | `GET /penerbit/buku` (`publisher.books`) |
| 3 | `pesanan_masuk_desktop.html` | 714 | `publisher/orders.blade.php` | `GET /penerbit/pesanan` (`publisher.orders`) |
| 4 | `pendapatan_dan_pencairan_desktop.html` | 965 | `publisher/finance.blade.php` | `GET /penerbit/keuangan` (`publisher.payouts`) |
| 5 | `ulasan_pembeli_desktop.html` | 691 | `publisher/reviews.blade.php` | `GET /penerbit/ulasan` (`publisher.reviews`) |
| 6 | `pengaturan_profil_desktop.html` | 752 | `publisher/settings.blade.php` | `GET /penerbit/pengaturan` (`publisher.settings`) |
| 7 | `invoice_penjualan_pdf_portal_penerbit.html` | 312 | `publisher/invoice.blade.php` | `GET /penerbit/invoice/{order?}` (`publisher.invoice`) |
| 8 | `masuk_portal_penerbit_desktop.html` | 31 (alias) | — | `GET /penerbit/masuk` → **302** `/masuk?role=publisher` (`publisher.login`) |
| 9 | `pendaftaran_penerbit_desktop.html` | 31 (alias) | — | `GET /penerbit/daftar` → **302** `/daftar?role=publisher` (`publisher.register`) |

Kontrak alias dipertahankan: dua halaman itu di prototype memang hanya `meta refresh` + `location.replace` ke auth
terpadu. Tidak ada form kedua yang dibuat; `AuthDemoController` (P06) tetap satu-satunya pemilik form masuk/daftar.

`access-guard.js` (31 baris) adalah gerbang preview browser-side. **Tidak dipasang** di build Laravel: komentarnya
sendiri menyatakan pengunjung tanpa pengajuan tersimpan tidak diblokir, dan P02 menemukan bahwa guard ini memblokir
halaman lain dalam profil browser yang sama (D5). Ini dicatat di §7 sebagai batasan, bukan janji keamanan; status
pengajuan demo tetap dapat diuji lewat `/status-pendaftaran-penerbit` (P06).

## 2. Shell & partial

Shell sepenuhnya memakai infrastruktur P04 (bukan template dashboard baru):

- `layouts/publisher` → `layouts/portal` → `partials/portal/{topbar,sidebar,banner}` (banner geometris ungu
  angled `h-[232px] sm:h-[260px] lg:h-[276px]`, topbar 64px, sidebar 248px, frame `max-w-[1560px]`).
- **Baru:** prop `manual_shell`. Halaman Penerbit membawa skrip prototype yang mengikat `#sidebar-toggle`,
  `#btn-notif`, `#notif-panel`, `#sidebar-scrim` menurut id. Dalam mode manual, partial mengeluarkan id tersebut
  dan melepas hook `data-ikapi-*`, sehingga `shell.js` diam dan tidak ada toggle ganda. Halaman bukti P04 tetap
  memakai hook.
- **Diperbaiki:** `layouts/portal` sekarang juga merender `@stack('overlays')` (sebelumnya hanya `@yield`), karena
  Blade tidak merender `@push` lewat `@yield`; akibatnya seluruh modal/drawer Penerbit sebelumnya tidak muncul.
- Modal/drawer tiap halaman dipindahkan ke `@push('overlays')` di luar `<main id="workspace">` (workspace `z-10`
  tidak bisa menutupi sidebar `z-40`), sama seperti alasan P04.

## 3. Data contract (untuk P09/P10)

Satu fixture: `resources/data/ikapi/publisher.json`, diekstrak dari literal di skrip prototype
(`tools/p8-fixtures.mjs`, bracket-match + evaluasi dengan helper `rupiah()`), bukan diketik ulang:

| Key | Bentuk | Dipakai |
|---|---|---|
| `DEMO` | `{updated, evalSamples, daily[30], sold(=Σdaily→103)}` | dashboard: grafik 30 hari + KPI terjual |
| `FILLED` / `EMPTY` | 8 KPI: `books, booksSub, sold, soldSub, revenue, revenueSub, balance, balanceSub` | dashboard state normal/kosong |
| `BASE_ORDERS[]` | 5 pesanan: `id, date, qty, net, status, book, author, cover, items[]` | pesanan masuk |
| `BASE` | `{net, available, pending, bank, bankName, holder, masked, withdrawals[]}` | pendapatan & pencairan |
| `BASE_REVIEWS[]` | 4 ulasan: `id, book, author, rating, date, content, reply{content,date}|null` | ulasan pembeli |
| `SAVED_PROFILE` | `{name, pic, email, phone, address, member}` | pengaturan profil |
| `SAVED_BANK` | `{bank, number, holder}` | rekening pencairan |

Konsistensi lintas halaman (diuji): angka yang sama muncul di beberapa layar — mis. `net Rp 1.485.000` di dashboard
dan di keuangan, `sold 103` = jumlah kolom Terjual di kelola buku (`DEMO.daily` dijumlahkan), pesanan `ORD-2026-11082`
= invoice `INV/2026/11/041-0082`. Data buku (5 baris) tetap di markup tabel (`tr[data-id]`) seperti prototipe, karena
halaman itu memang membacanya dari DOM; bukan dataset kedua.

Mutasi demo (pencairan, balasan ulasan, tambah buku, profil) hidup di state runtime halaman dan **tidak** disimpan
lintas muat ulang, sama seperti prototype (tidak ada localStorage di area ini); keterbatasan ini eksplisit di §7.

## 4. Matriks skenario fungsional (`p8-flows.json`, 7 skenario, 0 error, 0 respons ≥400)

| # | Skenario | Hasil terukur |
|---|---|---|
| 1 | Navigasi dashboard → buku → pesanan → keuangan + reload | KPI `4 / 103 / Rp 1.485.000 / Rp 840.000`; 5 baris buku, 5 pesanan, drawer detail pesanan terbuka; angka keuangan sama setelah reload |
| 2 | Shell mobile: drawer, scrim, notifikasi, Escape (viewport 390) | drawer bergeser + scrim tampil + `aria-expanded=true` + body terkunci; Escape menutup drawer; panel notifikasi buka/tutup dan Escape menutupnya |
| 3 | Kelola buku: cari, filter status, menu baris, drawer detail, form tambah + validasi | 5 baris → **1** saat cari "laskar"; filter Draft → **1** baris; menu baris terbuka; drawer detail buka/tutup; form tambah terbuka dan menampilkan pesan validasi saat submit kosong |
| 4 | Pencairan simulasi (tanpa uang nyata) | nominal + centang → "Tinjau Pengajuan" (`#modal-confirm`, 3 tombol) → `#btn-submit` → **modal sukses muncul setelah 1.000 ms**; saldo `Rp 840.000 → Rp 590.000`; Escape menutup modal |
| 5 | Ulasan: filter, balas, validasi kosong | 4 kartu; filter "Belum Dibalas" → 2; editor balasan terbuka; kirim → hitungan `Belum 2→1`, `Sudah 2→3`; kirim kosong → pesan error `Balasan tidak boleh kosong` |
| 6 | Pengaturan: edit profil, catatan perubahan, batal, form rekening + modal tinjau | catatan "belum disimpan" muncul saat mengetik; Batal membersihkan catatan (nilai diketik tetap, sama seperti prototype); form rekening terbuka; modal tinjau rekening tampil; Escape menutup |
| 7 | Alias login/daftar, status pengajuan demo, invoice | `/penerbit/masuk` → 302 → `/masuk?role=publisher`; `/penerbit/daftar` → 302 → `/daftar?role=publisher`; chip "Ditolak" → label "Tidak disetujui"; invoice `INV/2026/11/041-0082`, 5 baris item, tombol cetak ada |

## 5. Paritas visual (screenshot diff, ambang 0) — 4 viewport

`1440x900`, `1366x768`, `390x844`, `320x700`; konteks browser baru per halaman; caret dinonaktifkan.

| Halaman | 1440 | 1366 | 390 | 320 | Tinggi (blade/proto) |
|---|---|---|---|---|---|
| Dashboard | **0** | **0** | **0** | **0** | 1409 / 1439 / 2529 / 2613 (identik) |
| Kelola Buku | **0** | **0** | **0** | **0** | 942 / 942 / 1026 / 1095 |
| Pesanan Masuk | **0** | **0** | **0** | **0** | 964 / 964 / 1064 / 1085 |
| Pendapatan & Pencairan | **0** | **0** | **0** | **0** | 1333 / 1333 / 2092 / 2213 |
| Ulasan Pembeli | **0** | **0** | **0** | **0** | 1748 / 1770 / 2132 / 2367 |
| Pengaturan Profil | **0** | **0** | **0** | **0** | 1187 / 1187 / 1339 / 1380 |
| Invoice | 0,0001 | 0,0001 | 0,0003 | 0,0003 | 1268 / 1268 / 1845 / 1909 |

Teks `main` identik di keduanya untuk semua halaman/viewport. `brokenImages` = 1 di **kedua** sisi pada Kelola Buku
(`<img src="">` placeholder di sumber, cacat D4 P02). Invoice pada 320px melebar 340px di **kedua** sisi (lembar
invoice A4 tidak menyusut di bawah 340px) — perilaku sumber, bukan regresi.

## 6. Perubahan teknis yang dijelaskan (bukan regresi)

| # | Perubahan | Alasan | Bukti |
|---|---|---|---|
| C1 | Shell id mode manual (`manual_shell`) | skrip prototype mengikat `#sidebar-toggle`/`#btn-notif`/`#notif-panel`/`#sidebar-scrim`; hook P04 akan menggandakan toggle | drawer & notifikasi lulus di 390px |
| C2 | `@stack('overlays')` di `layouts/portal` | modal Penerbit di-`@push`; `@yield` tidak merendernya | seluruh modal/drawer muncul; tanpa ini 3 halaman kehilangan overlay |
| C3 | Guard modul per halaman (`#kpi-container`, `#book-search`, `#order-search`, `#btn-export`, `#review-summary`, `#profile-form`) | semua modul diimpor di satu bundel dan shell `#workspace` ada di semua halaman; guard lama membuat modul lain jalan dan error | diff 0 di 6 halaman, 0 error JS |
| C4 | `data-*` ikut ditulis ulang ke `asset()` | tabel buku menyimpan `data-cover="../../assets/covers/..."` dan skrip memasangnya ke `<img>` | 404 `/assets/covers/...` → 0 |
| C5 | `th/td/caption { padding: 1px }` di `@layer base` | preflight v4 mereset padding semua elemen (`* { padding: 0 }`); v3 tidak, sehingga `<th>`/`<td>` mempertahankan padding bawaan 1px | invoice 0,0074 → **0,0001**; tanpa ini seluruh lembar bergeser 1px |
| C6 | `--color-white`/`--color-black` di `@theme inline` | `bg-white/95` dikompilasi `color-mix(in oklab, …)`; v3 mengeluarkan `#fffffff2` | toolbar invoice 0,0035 → 0 |
| C7 | Nomor urut/format uang memakai `rupiah()` sumber apa adanya | angka harus sama dengan prototype & antarhalaman | uji konsistensi §3 |
| C8 | Halaman invoice memakai `layouts/plain` + style blok halaman (`@media print`) | invoice bukan shell portal (tanpa sidebar/banner), sesuai sumber | diff 0,0001, tombol cetak ada |
| C9 | Alias `/penerbit/masuk` & `/penerbit/daftar` sebagai route redirect | kontrak alias dipertahankan; tidak membuat form kedua | skenario 7 (302 → auth terpadu) |

## 7. Cacat baseline & batasan yang dicatat (tidak diperbaiki diam-diam)

| # | Hal | Bukti | Status |
|---|---|---|---|
| D-08-1 | Tombol **Batal** pada form profil tidak mengembalikan nilai yang sudah diketik (hanya membersihkan catatan "belum disimpan") | diuji di halaman prototype dan di Blade: keduanya sama | Dipertahankan (di luar scope P08); kandidat perbaikan terpisah |
| D-08-2 | `<img src="">` placeholder pada tabel buku | 1 gambar rusak di kedua sisi | Dipertahankan (D4 P02) |
| D-08-3 | `access-guard.js` tidak dipasang | guard ini hanya penanda preview, dan P02 D5 menunjukkan ia memblokir halaman lain dalam profil browser yang sama | Dicatat; bukan kontrol keamanan |
| D-08-4 | Mutasi demo (pencairan, balasan, tambah buku, profil) tidak bertahan setelah reload | prototype juga tidak menyimpannya (tidak ada localStorage di area ini) | Dipertahankan; konsistensi angka awal tetap dari fixture yang sama |
| D-08-5 | Panel "Mode Demo" (9 state) ada di halaman produk | markup sumber | Dipertahankan; berguna untuk P11 |
| D-08-6 | Invoice pada 320px melebar (340px) | diukur di kedua sisi | Dipertahankan (lembar A4) |

## 8. Integrasi berikutnya

- **P09 (admin)**: membaca `publisher.json` untuk angka yang sama (pendapatan, pesanan, ulasan) dan
  `ikapi_discussion_reports_demo` untuk moderasi diskusi; jangan membuat dataset kedua. Menu sidebar admin
  **tidak** disamakan dengan Penerbit (`Navigation::items('admin')` sudah terpisah sejak P04).
- **P10**: alur pembeli ↔ penerbit yang tersisa (mis. tautan status pengajuan) memakai route `publisher.dashboard`
  yang sudah ada.
- **P11**: mode demo 9 state tiap halaman bisa dipakai sebagai resep regression; jalankan ulang baseline P02 dengan
  `th/td` padding dan `--color-white` inline yang sekarang global.

## 9. Status kriteria penyelesaian (p8.md *Completion gate*)

| Kriteria | Status | Bukti |
|---|---|---|
| Semua halaman unik Penerbit dikonversi; alias/redirect dipertahankan | **Lulus** | 7 halaman Blade + 2 route alias 302 (§1) |
| Shell & responsive sesuai baseline | **Lulus** | §5: 0 selisih di 4 viewport; drawer/notifikasi/ Escape lulus (skenario 2) |
| Semua interaksi demo berfungsi | **Lulus** | §4: 7 skenario, 0 error, 0 respons ≥400 |
| Data berelasi konsisten; tanpa auth/backend/DB/payout nyata | **Lulus** | §3 (satu fixture, angka sama antarhalaman), tidak ada `Auth::`, tidak ada gateway, tidak ada query DB |
| Tanpa aset rusak, rute tak dikenal, error JS, atau regresi visual tak dijelaskan | **Lulus** | 404 aset 0; semua route 200/302; error JS 0; sisa selisih 0,0001–0,0003 dijelaskan (§5/§6) |

Verifikasi: `node docs/migration/tools/p8-parity.mjs` (7 halaman × 4 viewport), `p8-flows.mjs` (7 skenario),
`p8-extract.mjs`/`p8-build.py`/`p8-fixtures.mjs` (regenerasi dari sumber). `phpstan` 0 error, `pint --test` lulus,
`npm run build` lulus, `php artisan view:cache` lulus, 10 route `penerbit.*`.