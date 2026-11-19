# P05 — Migrasi Inti Pembeli: Beranda, Katalog, Detail, Preview Buku

Fase: konversi empat halaman inti buyer. Prototype HTML tidak diubah (`git status docs/design/prototype-copy` = 0).
Bukti: `docs/migration/p5-parity.json` (screenshot+diff), `p5-interactions.json` (matriks interaksi),
`baselines/p5/**` (PNG), `p5-source/**` (dump sumber + ekstraksi), tools di `docs/migration/tools/*p5*`.

## 1. Peta source → view → route

| Source HTML | View Blade | Partial | Route (name) |
|---|---|---|---|
| `user/beranda_desktop.html` (1.002 l) | `buyer/home.blade.php` | `partials/buyer/{hero,categories,shelf,agenda,toast}` | `GET /` (`home`) |
| `user/katalog_buku_desktop.html` (913 l) | `buyer/catalog/index.blade.php` | `partials/buyer/catalog/{filters}`, `components/ikapi/book-card` (grid) | `GET /katalog` (`books.index`) |
| `user/detail_buku_desktop.html` (1.899 l) | `buyer/books/show.blade.php` | `partials/buyer/books/{hero,about,rating,related,report-modals}` | `GET /buku/{slug}` (`books.show`) |
| `user/preview_buku_desktop.html` (335 l) | `buyer/books/preview.blade.php` | `partials/buyer/toast` | `GET /buku/{slug}/cuplikan` (`books.preview`) |
| — (baru) | `errors/404.blade.php` | — | slug tidak dikenal → 404 |

Shared yang dipakai ulang: `layouts.public` (P04) + `components/ikapi/head`, `components/ikapi/book-card`
(varian `grid`/`shelf`), `partials/buyer/toast`, dan widget chatbot (`resources/js/ikapi/buyer/chatbot-widget.js`,
entry Vite terpisah karena prototype memuatnya hanya di 5 halaman buyer — halaman memilih dengan `@vite`).
Layout publik P04 ditambah dua section: `no_header` (preview tidak punya navbar) dan `@stack('overlays')`.

## 2. Fixture (satu sumber, tanpa data baru)

Dibuat `docs/migration/tools/build-fixtures-p5.mjs` yang membaca prototype dan menulis:

| Berkas | Isi | Asal |
|---|---|---|
| `resources/data/ikapi/books.json` | **27 buku** = 12 buku katalog + 15 buku rak beranda (dedup per slug). Buku referensi (`laskar-aksara-pasundan`) membawa blok `detail` | `rawCatalogBooks`, kartu rak beranda, halaman detail |
| `resources/data/ikapi/home.json` | 3 slide hero, 5 tile kategori, 3 rak (referensi slug), 4 kartu agenda | beranda |
| `resources/data/ikapi/catalog.json` | facet (4 kategori, 4 penerbit, hitungan, `allCount`), 5 opsi sort, rentang harga, default (sort `az`, grid, pageSize 12) | halaman katalog |
| `resources/data/ikapi/preview.json` | 4 halaman cuplikan (num/chapter/title/paragraphs) | halaman preview |

`App\Support\Fixtures` menyediakan `home()`, `catalog()`, `book($slug)`, `booksBySlugs()`, `preview()`.
`resources/data/ikapi/{communities,orders,users}.json` (P03) tetap ada untuk fase portal.

Jaminan "satu sumber": katalog, rak beranda, detail, dan preview semuanya membaca `books.json`; kartu di katalog
dan di rak memakai komponen yang sama (`book-card`), dan halaman detail membaca baris yang sama dengan kartu katalog.

## 3. Komponen yang dipakai ulang (tidak ada mega-component baru)

- `<x-ikapi.book-card variant="grid">` → 12 kartu katalog (Blade + re-render JS memakai template kelas identik).
- `<x-ikapi.book-card variant="shelf">` → 15 kartu rak beranda **dan** 4 kartu "Buku Terkait".
- `partials/buyer/toast` → 4 halaman (dua varian posisi/offset sesuai prototype: `bottom-24 translate-y-16` di beranda,
  `bottom-24 translate-y-20` di katalog, `bottom-6 translate-y-20` di detail & preview).
- `partials/public/{header,footer}` dari P04 → dipakai apa adanya (beranda/katalog/detail; preview tanpa header/footer).

Tidak ada komponen baru yang dibuat khusus P05 selain partial section di atas: kartu buku, modal laporan, dan
menu komentar berasal dari markup sumber yang disalin verbatim.

## 4. Matriks interaksi (hasil nyata dari `p5-interactions.json`)

| Interaksi | Sumber (HTML) | Implementasi | Hasil terukur |
|---|---|---|---|
| Beranda → Katalog → Detail → Preview → Back | `href` antarhalaman | named route + komponen kartu | `/katalog` (12 kartu) → `/buku/antologi-puisi-lembayung` → `/buku/.../cuplikan` → back ke detail → back ke katalog; 0 error |
| Search katalog | `input#catalog-search-input` (+ header search) | `catalog.js` pipeline (debounce tidak dipakai, sama seperti sumber) | "laskar" → 1 kartu |
| Filter kategori | 4 checkbox + "Semua Kategori" | pipeline + sinkronisasi checkbox "all" | Pendidikan → 3 kartu, `#cat-all` otomatis tidak tercentang |
| Filter penerbit | 4 checkbox | pipeline | UPI Press → 4 kartu |
| Rentang harga | `#price-min-input`/`#price-max-input` + Terapkan | validasi `min<0 || max<min` + toast, sama seperti sumber | pesan error identik saat rentang tidak valid |
| Sort | `#catalog-sort-select` (5 opsi) | 5 pembanding identik | `price_high` → kartu pertama "Ekonomi Kerakyatan Jawa Barat" |
| Grid/List | 2 tombol | template kelas identik (`grid ...` / `flex flex-col gap-4`) | kelas kontainer terganti tepat |
| Reset filter | tombol Reset + tombol di empty state | `resetAllFilters()` | kembali 12 kartu, sort `az` |
| Empty state | `#catalog-empty-state` | ditampilkan saat 0 hasil, grid disembunyikan | terlihat saat pencarian "zzzznotfound" |
| Pagination | bar + tombol prev/next | **no-op** seperti prototipe (12 buku = 1 halaman) → tombol tetap `disabled` | tombol tidak aktif (sama dengan referensi) |
| Rating bintang (detail) | 5 tombol `role=radio` | pilih/hover + label "Sangat bagus (5 bintang)" | 5 bintang, label berubah, tersimpan di `ikapi_rating_<slug>` (buku referensi tetap `ikapi_rating_laskar_aksara`) |
| Kirim ulasan | `#btn-submit-rating` | injeksi kartu "Kamu" + hitungan "4 ulasan (termasuk kamu)" | kartu pengguna muncul, badge berubah, hapus penilaian mengembalikan ke 3 ulasan |
| Wishlist | `#btnWishlist` | toggle ikon `favorite`/`favorite_border` | ikon jadi `favorite`, toast "Buku ditambahkan ke favorit" |
| Tambah ke keranjang | `#btnAddToCart` + tombol kartu terkait | badge header + label "Ditambahkan" 1,5 s + toast | badge 2 → 3, toast tampil |
| Menu komentar | `.comment-menu-btn` (3 ulasan) | menu popover + `positionMenu()` | menu terbuka, fokus pindah ke item pertama |
| Reaksi komentar | item Suka/Tidak Suka | tersimpan di `ikapi_comment_reactions_demo` | badge reaksi muncul di item |
| Laporkan komentar | `#comment-menu [data-action=report]` | dialog `#report-modal`, 5 alasan, validasi + guard duplikat, simpan `ikapi_comment_reports_demo` | 5 alasan; tanpa alasan → error; setelah kirim → 1 record `RPT-DEMO-001` (status `pending`) |
| Laporkan buku | `#btn-report-book` | dialog `#book-report-modal`, 4 jenis + field "Bagian bermasalah" kondisional, simpan `ikapi_book_reports_demo` | 4 jenis; field bagian muncul untuk jenis `file`; tersimpan sebagai `LPR-DEMO-001` (`reportStatus: 'baru'`) |
| Preview: navigasi | `#btn-prev`/`#btn-next` | `goToPage/renderPage` | "Cuplikan 1 dari 4" → 2 → 4; prev disabled di awal, next disabled di akhir; progress 25% → 50% → 100% |
| Preview: akhir cuplikan | kotak "Akhir Cuplikan Buku" | hanya di halaman terakhir | 1 kotak muncul di halaman 4 |
| Preview: beli | `#btnAddToCart` | label "Ditambahkan ke Keranjang" + toast | label berubah, toast tampil |

Semua skenario: **0 error JS, 0 respons ≥400** (kecuali 404 yang disengaja pada slug tidak dikenal).

## 5. Hasil paritas (viewport sama, engine sama, ambang 0)

| Halaman | 1440×900 | 1366×768 | 768×1024 | 390×844 | 320×700 | Catatan |
|---|---|---|---|---|---|---|
| Beranda | **0** | **0** | **0** | **0** | **0** | tinggi identik di kelima viewport (3663/3663, 5060, 5643), 19 kartu, 0 gambar rusak |
| Preview | **0** | **0** | **0** | **0** | **0** | tinggi identik (1239, 1339, 2438) |
| Katalog | 2.324 px (0,18%) | 0,23% | 0,19% | **0** | 0,29% | tinggi identik di kelima viewport; sisa = noise resampling cover (Δ≤12/255, tanpa pergeseran) dari re-render klien + artefak `position: sticky` pada screenshot full-page |
| Detail | 0,26% | ratio 1 (size) | ratio 1 (size) | 0,84% | ratio 1 (size) | tinggi −40 px (1440) / −63 px (768) / −131 px (320) karena cacat struktur referensi (D-05-1); section 0/1/3 dan kartu terkait identik |

Verifikasi pendukung: `#catalog-products-container` 12 kartu, urutan A–Z sama, ukuran kartu & grid identik
(306×577,75 untuk 4 kolom "Buku Terkait"), tinggi section 0/1/3 detail identik, tinggi section rating identik
kecuali container ulasan (cacat referensi), semua font (DM Sans + Literata untuk `font-reading`) dan ikon
Material Symbols ter-load, 0 gambar rusak selain placeholder modal yang memang `src=""` di sumber (1 di kedua sisi).

## 6. Perubahan yang dijelaskan (bukan regresi)

| # | Perubahan | Alasan | Bukti |
|---|---|---|---|
| C1 | Kelas alpha transparan memakai bentuk literal (`bg-[#ffffff1a]`, `hover:border-[#673de666]`) | v4 mengompilasi `/opacity` lewat `color-mix(in oklab)` → selisih 1–10/255 vs sRGB referensi (temuan P04 P4-2) | `p5-parity.json` (ratio 0 di beranda/preview) |
| C2 | `space-y-*`: arah dikembalikan ke v3 + margin v4 dinolkan | v4 memindahkan margin ke sibling sebelumnya; elemen inline mengabaikan margin blok sehingga jarak hilang, dan tanpa reset akan dobel | sel katalog 68 px (sebelumnya 64), wrapper textarea 108,5 px (sebelumnya 114,5) |
| C3 | `.shadow-xs { box-shadow: none }` (unlayered) | v3 tidak punya `shadow-xs`; v4 tetap mengomposit daftar shadow transparan → tepi rounded bergeser 1–2/255 | 1.039 → 524 px diff pada rak beranda |
| C4 | Stylesheet ikon dimuat dalam cascade layer | Google mengirim `.material-symbols-outlined{font-size:24px}` tanpa layer sehingga `text-[20px]` kalah | ikon kembali 18/20/22 px sesuai referensi |
| C5 | Rute `{slug}` + kartu mengirim slug | Prototipe mengirim semua kartu ke satu halaman tanpa ID (defect baseline P01) | `/buku/<slug>` resolusi per buku; slug tak dikenal → 404 |
| C6 | Buku selain referensi: sinopsis/detail/ulasan/terkait menampilkan status "belum tersedia di prototipe" | Prototipe hanya punya satu halaman detail (BK-01); tidak ada data untuk 26 buku lain dan tidak boleh diciptakan | halaman `/buku/pride-and-prejudice` merender metadata katalog + state jujur, 0 error |
| C7 | Teks dari JS di-escape saat diinjeksi (`catalog.js`, `detail.js`, `preview.js`) | Prototipe menyisipkan teks apa adanya ke `innerHTML` | audit: satu helper `escapeHtml` di tiap modul |
| C8 | Handler inline (`onclick`) diganti data-hook | CSP/internal style; perilaku dijaga JS modul | 0 `onclick` di Blade P05 |
| C9 | `@stack('overlays')` di layout publik | `@push` tidak pernah dirender oleh `@yield`; toast + 3 dialog detail tidak muncul | toast ada di 4 halaman, 3 dialog detail ada (ditemukan oleh matriks interaksi) |

## 7. Cacat referensi yang ditemukan (dicatat, bukan diperbaiki diam-diam)

| # | Cacat | Bukti | Status |
|---|---|---|---|
| D-05-1 | **Struktur ulasan ke-3 rusak**: `<p class="review-body">` ulasan "Fajar Ashari" berada **di luar** `<article>` (sibling di dalam `#reviews-list-container`), sehingga container 387,00 px vs 347,25 px di Blade dan tinggi halaman berbeda −40 px (1440) / −108 px (390) | probe DOM kedua halaman (`#reviews-list-container > *`): referensi = 3 article + 1 p; Blade = 3 article (body di dalam) | Tidak ditiru (markup rusak); perlu persetujuan pemilik atau pekerjaan terpisah |
| D-05-2 | `<img id="book-report-cover" src="">` placeholder di dialog "Laporkan Buku" (diisi JS) | `manifest.json` P02 (D4) + paritas: 1 gambar rusak di kedua sisi | Dipertahankan apa adanya |
| D-05-3 | Rak beranda memakai ulang berkas cover yang sama untuk judul berbeda (mis. `B02.jpg` = "Pendidikan Karakter Sunda" di katalog, "Frankenstein" di rak) | fixture: 27 baris, 16 berkas cover | Dipertahankan (tidak ada gambar pengganti) |
| D-05-4 | Semua kartu katalog/rak di prototipe menuju satu halaman detail tanpa ID | P01 §5.3 | Diganti rute ber-slug (C5), dicatat sebagai kontrak lama |
| D-05-5 | Pagination katalog `changeCatalogPage()` tidak melakukan apa pun | sumber baris ~780 | Ditiru apa adanya (tombol disabled) |

## 8. Titik integrasi untuk fase berikutnya

- **P06 (keranjang/checkout/perpustakaan)**: tombol tambah-keranjang hanya menaikkan badge demo (`bumpCartBadge`) dan
  menampilkan toast; `resources/js/ikapi/demo/state.js` sudah memiliki key `ikapi_*` yang diperlukan. Tombol
  keranjang & login/daftar di header masih `href="#"` (rute P06 belum ada).
- **P06/P07**: tautan "Agenda Literasi" pada beranda memakai `Navigation::href('agenda')`; selama rute belum
  terdaftar kartu dirender tanpa tautan (bukan `#`).
- **P07 (agenda)**: kartu agenda memakai gambar `events/*.jpg` dan teks tanggal/lokasi dari fixture; tidak ada CTA baru.
- **P08/P09 (portal)**: `Fixtures::orders()`/`users()` belum dipakai halaman buyer; `book-reports` dan
  `comment-reports` di localStorage memakai bentuk record yang sama dengan antrean moderasi admin (P02), sehingga
  penyambungan cukup membaca key yang sama.
- **P11 (QA)**: sisa selisih AA katalog (0,18% piksel, Δ≤12) dan cacat D-05-1 perlu keputusan sebelum dianggap bersih.

## 9. Acceptance criteria — status

| Kriteria | Status | Bukti |
|---|---|---|
| Empat halaman/subflow ada; direct URL + reload bekerja | **Lulus** | `/`, `/katalog`, `/buku/{slug}`, `/buku/{slug}/cuplikan` → 200 dan stabil setelah reload; slug tak dikenal → 404 (halaman 404 memakai shell publik + `notfoundil.png`) |
| Konten/urutan dan gambar sesuai HTML acuan | **Lulus** | paritas 0 px di beranda & preview; katalog 0,18% (AA/resampling) ; 27 baris buku & 16 cover berasal dari sumber; 0 gambar rusak |
| Search/filter/sort/preview berfungsi sesuai prototype | **Lulus** | matriks interaksi §4 (search 1 kartu, kategori 3, penerbit 4, sort, reset, empty state, view toggle, rating, laporan, navigasi cuplikan) |
| Tidak ada asset 404 / JS error terkait migrasi / diff visual tak dijelaskan | **Lulus** | matriks: 0 error, 0 respons ≥400; diff yang tersisa dijelaskan di §5–§7 |
| Layout dipakai bersama tanpa menggandakan header/footer | **Lulus** | `layouts.public` + partial P04; 0 salinan header/footer di view P05 |
| Dummy fixture punya satu sumber & tidak butuh database | **Lulus** | `resources/data/ikapi/{books,home,catalog,preview}.json` + `Fixtures`; tidak ada query DB (tidak ada migrate/seed dijalankan) |

Perintah verifikasi: `P5_BASE=… node docs/migration/tools/p5-parity.mjs [page]` dan `… p5-interactions.mjs`
(lihat `docs/migration/tools/`). Kualitas kode: `phpstan` level 7 = 0 error, `pint --test` = passed.
