# P09 — Portal Administrator + Moderasi (frontend-only)

Sumber: `docs/design/prototype-copy/admin/*.html` (9 halaman + `admin-guard.js`).
Prototype **tidak diubah** (`git status docs/design/prototype-copy` = 0, `docs/design/assets` = 0).
Bukti: `p9-parity.json` + `baselines/p9/**` (screenshot+diff 5 viewport), `p9-flows.json` (9 skenario),
`p9-source/**` (fragmen verbatim per halaman), `resources/data/ikapi/admin.json` (fixture demo).

## 1. Peta sumber → Blade → route

| # | Sumber (`admin/`) | Baris | Blade | Route (name) |
|---|---|---|---|---|
| 1 | `dashboard_administrasi_utama_desktop.html` | 579 | `admin/dashboard.blade.php` | `GET /admin` (`admin.dashboard`) |
| 2 | `kelola_pengguna_desktop.html` | 875 | `admin/users.blade.php` | `GET /admin/pengguna` (`admin.users`) |
| 3 | `pengawasan_katalog_buku_global_desktop.html` | 1055 | `admin/catalog.blade.php` | `GET /admin/katalog` (`admin.catalog`) |
| 4 | `moderasi_ulasan_dan_komentar_desktop.html` | 829 | `admin/review-moderation.blade.php` | `GET /admin/moderasi-ulasan` (`admin.review-moderation`) |
| 5 | `monitoring_global_desktop.html` | 780 | `admin/monitoring.blade.php` | `GET /admin/monitoring` (`admin.monitoring`) |
| 6 | `kelola_pencairan_dana_desktop.html` | 1002 | `admin/payouts.blade.php` | `GET /admin/pencairan` (`admin.payouts`) |
| 7 | `kelola_komunitas_desktop.html` | 808 | `admin/communities.blade.php` | `GET /admin/komunitas` (`admin.communities`) |
| 8 | `moderasi_diskusi_komunitas_desktop.html` | 796 | `admin/discussion-moderation.blade.php` | `GET /admin/moderasi-diskusi` (`admin.discussion-moderation`) |
| 9 | `login_administrator_desktop.html` | 298 | `admin/login.blade.php` | `GET /admin/masuk` (`admin.login`) |

Nama route mengikuti registry `Navigation::items('admin')` dari P04, sehingga sidebar/`Navigation.php` langsung
tersambung tanpa jalur bayangan. Tidak ada satu Blade raksasa: sembilan view terpisah, masing-masing hanya memuat
satu layar.

`admin-guard.js` **tidak dipasang** (alasan sama dengan P08 §7): file itu hanya penanda preview dan P02 D5
menunjukkan ia memblokir halaman lain dalam profil browser yang sama. Login admin tetap punya jalur demo eksplisit
(§5 skenario 9) dan tidak mengklaim keamanan.

## 2. Shell, partial, dan komponen bersama

- `layouts/admin` → `layouts/portal` (P04): banner geometris ungu angled `h-[232px] sm:h-[260px] lg:h-[276px]`,
  topbar 64px, sidebar 248px, workspace `max-w-[1560px]`, drawer/drawer-scrim, toast.
- Prop `manual_shell` (dibuat di P08) dipakai ulang: halaman Admin membawa skrip prototype sendiri, jadi partial
  mengeluarkan id asli (`#sidebar-toggle`, `#btn-notif`, `#notif-panel`, `#sidebar-scrim`) dan `shell.js` diam.
- Overlay tiap halaman (`drawer-scrim`, `*-drawer`, `modal-*`, `toast`) dipindah ke `@push('overlays')` di luar
  `<main id="workspace">` (workspace `z-10` tidak dapat menutupi sidebar `z-40`).
- **Tidak** membuat komponen tabel/status generik baru: bentuk tabel, chip status, dan drawer berbeda-beda antar
  halaman (lebar kolom, jumlah aksi, isi drawer), jadi memaksakan satu komponen akan mengubah tampilan. Yang dipakai
  ulang adalah shell + overlay + pola `data-*` yang sudah ada.

## 3. Fixture & kontrak data (dipakai juga oleh P10/P11)

Satu fixture `resources/data/ikapi/admin.json`, diekstrak literal dari skrip sumber (`tools/p9-fixtures.mjs`):

| Key | Bentuk | Halaman |
|---|---|---|
| `BASE` | `{kpi:{revenue,paid,books,publishers}, queue[4], activity[]}` | dashboard |
| `BASE_USERS[]` | 4 akun: `key, reg, name, role, pj, email, phone, address, registration, account, …` | kelola pengguna |
| `BASE_REPORTS[]` + `BASE_CATALOG[]` | 2 laporan buku (target `review`/`book`) + 2 entri katalog | pengawasan katalog |
| `BASE_RECORDS[]` | 3 laporan ulasan/komentar produk: `key, id, user, handle, comment, book, category, decision, reporters…` | moderasi ulasan |
| `BASE_TX[]` | 10 transaksi: `date, publisher, orders, gross, net` | monitoring global |
| `BASE_PAYOUTS[]` | 4 pengajuan pencairan: `id, publisher, bank, amount, status, …` | kelola pencairan |
| `DEFAULTS[]` | 3 komunitas (bentuk identik dengan store P07) | kelola komunitas |
| `seeds[]` | 2 laporan diskusi demo: `targetType, targetId, communityId, reasonId, status` | moderasi diskusi |

**Kontrak lintas fitur** (diuji di §5):

| Data | Ditulis oleh | Dibaca oleh |
|---|---|---|
| `ikapi_communities_demo` | P07 (buyer core) dan halaman Admin Kelola Komunitas | direktori pembeli + admin |
| `ikapi_community_topics_demo` / `_replies_demo` | P07, Admin Moderasi Diskusi (menandai `removed`) | topik pembeli + admin |
| `ikapi_discussion_reports_demo` | buyer (lapor balasan) + seed admin | antrean moderasi admin |
| `ikapi_admin_session_demo` | halaman login admin (pratinjau) | penanda demo, bukan otorisasi |
| `ikapi_buyer_session_demo`, `ikapi_publisher_application_demo` | P06 | tidak diubah P09 |

Tidak ada dataset kedua untuk admin; angka dashboard/pencairan/monitoring berasal dari fixture yang sama dengan
halaman penerbit (P08) di mana relasinya ada. KPI yang di sumber memang statis (mis. `kpi.publishers`) dicatat
sebagai fixture, bukan dihitung ulang (lihat §7).

## 4. Paritas visual (ambang 0) — 5 viewport

1440×900, 1366×768, 768×1024, 390×844, 320×700; konteks baru per halaman; caret nonaktif; settling 1,0 s + `fonts.ready`
(400 ms pernah menangkap frame pertama font swap).

| Halaman | 1440 | 1366 | 768 | 390 | 320 |
|---|---|---|---|---|---|
| Dashboard | **0** | **0** | **0** | **0** | **0** |
| Kelola Pengguna | **0** | **0** | **0** | **0** | **0** |
| Pengawasan Katalog | **0** | **0** | **0** | **0** | **0** |
| Moderasi Ulasan | **0** | **0** | **0** | **0** | **0** |
| Monitoring Global | **0** | 0,000021 | **0** | 0,000039 | **0** |
| Kelola Pencairan | **0** | **0** | **0** | **0** | **0** |
| Kelola Komunitas | **0** | **0** | 0,000025 | **0** | **0** |
| Moderasi Diskusi | 0,000030 | 0,000037 | **0** | **0** | 0,000102 |
| Login Administrator | **0** | 0,000204 | **0** | **0,00065** | **0** |

Tinggi dokumen identik di semua pasangan dan teks `main` identik. Sisa ≤0,07% adalah rasterisasi teks/ikon
(beberapa puluh piksel, delta ≤10/255); tidak ada pergeseran tata letak.
`brokenImages` = 1 (moderasi ulasan, kedua sisi) dan 2 (komunitas, kedua sisi) — placeholder `<img src="">` di sumber
(cacat D4 P02).

## 5. Matriks interaksi (`p9-flows.json`, 9 skenario)

| # | Skenario | Hasil terukur |
|---|---|---|
| 1 | Shell + navigasi 8 layar + reload + drawer 390 | 9 tautan sidebar; `aria-current` di halaman aktif; 2 baris tetap setelah reload; drawer: scrim tampil, `aria-expanded=true`, body terkunci, Escape menutup |
| 2 | Pengguna: cari, filter peran, filter status, drawer, aksi | 2 baris → **1** saat cari "mizan"; filter peran kembali 2; drawer terbuka dengan fokus di `#drawer-close`; aksi drawer `["approve","reject"]`; modal setujui tampil; baris berubah setelah konfirmasi |
| 3 | Katalog: cari, drawer, keputusan | cari "naskah" → 0 (tidak ada judul cocok, sesuai data); drawer terbuka; tombol `#btn-takedown` aktif; pada baris laporan drawer menampilkan "Detail Laporan Buku" dan aksi "Tutup Laporan" |
| 4 | Moderasi ulasan: antrean, filter, drawer, hapus | "3 laporan menunggu peninjauan"; 6 kategori; 3 kartu; drawer terisi (kategori "Kata Kasar & Provokasi"); modal hapus tampil → konfirmasi → antrean berpindah ke laporan berikutnya |
| 5 | Monitoring: filter & reset | 5 baris transaksi; filter penerbit mengubah isi tabel; `#btn-reset` memulihkan; pemilih periode berupa satu opsi demo (dicatat) |
| 6 | Pencairan: cari, drawer, finalisasi | ringkasan "1 pengajuan menunggu Rp 645.000"; aksi baris "Periksa" membuka drawer; `#btn-finalize` aktif → modal finalisasi tampil → Escape menutup |
| 7 | Komunitas: buat komunitas → direktori pembeli | 3 → **4** baris; `ikapi_communities_demo` berisi "Komunitas Uji Admin"; direktori pembeli (`/komunitas`) menampilkan 4 komunitas termasuk yang baru (satu origin) |
| 8 | Moderasi diskusi lintas fitur | laporan buyer (1) tampil di antrean; drawer memuat konteks topik + "5 balasan lain pada topik ini"; aksi hapus → `report.status = "removed"`, target `RPL-P09-P` `removed: true`, **anak tetap hidup (1)**; halaman topik pembeli menampilkan **1 placeholder** "Komentar telah dihapus" dengan 6 node |
| 9 | Login admin (pratinjau) | submit kosong → error email + password tampil; submit valid → pesan "Autentikasi administrator belum tersedia…", tautan pratinjau + catatan tampil; klik pratinjau → `/admin`, `ikapi_admin_session_demo = {role:admin, preview:true}`; tidak ada klaim keamanan |

**9/9 lulus.** Satu error konsol tersisa dan itu **cacat prototype**: `ReferenceError: editable is not defined` saat
modal finalisasi pencairan dibuka (D1 P02) — direproduksi apa adanya di kedua sisi.

## 6. Perubahan teknis yang dijelaskan (bukan regresi)

| # | Perubahan | Alasan | Bukti |
|---|---|---|---|
| C1 | Guard modul per halaman (`#activity-list`, `#user-search`, `#cat-search`, `#mod-search`, `#revenue-chart`, `#payout-search`, `#community-rows`, `#tab-pending`, `#admin-login-form`) | semua modul ada di satu bundel; guard lama bertabrakan antar portal (modul dashboard Penerbit ikut jalan di `/admin` karena `#kpi-container` ada di keduanya) | diff 0 di 8 halaman, 0 error JS |
| C2 | `divide-y`/`divide-x` warna di `app.css` | v4 menaruh warna pada `:not(:last-child)`; dengan arah v3 anak terakhir mendapat garis tanpa warna (#e5e7eb vs #efeff2) | dashboard 0,0007 → **0** |
| C3 | `data-*` ditulis ulang ke `asset()` | baris tabel membawa `data-cover` yang dipasang ke `<img>` | 404 cover → 0 |
| C4 | Tautan statis ke berkas prototype → route aplikasi | tombol "Buka Pratinjau Dashboard" di halaman login menunjuk `dashboard_administrasi_utama_desktop.html` | 404 → `/admin` dan sesi demo tertulis |
| C5 | Shell `manual_shell` (warisan P08) dipakai untuk Admin | skrip sumber mengikat id asli `#sidebar-toggle` dkk. | drawer & notifikasi lulus di 390px |
| C6 | `@stack('overlays')` di `layouts/portal` (sudah diperbaiki di P08) | modal/drawer admin di-`@push`, bukan `@section` | 6 halaman dengan overlay tampil |
| C7 | Handler dipanggil via `evaluate(click)` pada beberapa kontrol | toolbar sumber menutupi titik tengah tombol (terverifikasi sama di halaman prototype), sehingga klik sintetis Playwright tidak pernah "actionable" | skenario 3/7/8 |

## 7. Cacat baseline & batasan yang dicatat

| # | Hal | Bukti | Status |
|---|---|---|---|
| D-09-1 | `ReferenceError: editable is not defined` saat membuka modal finalisasi pencairan | direproduksi di **kedua** sisi (prototype + Blade) | Dipertahankan (D1 P02); perbaikan terpisah |
| D-09-2 | `<img src="">` placeholder pada beberapa baris | 1–2 gambar rusak di kedua sisi | Dipertahankan (D4 P02) |
| D-09-3 | `admin-guard.js` tidak dipasang | guard preview, memblokir halaman lain dalam profil browser yang sama (P02 D5) | Dicatat; bukan kontrol keamanan |
| D-09-4 | KPI tertentu statis di fixture (mis. `kpi.publishers = 12`) tidak dihitung dari baris lain | nilai berasal dari sumber | Fixture, bukan angka karangan |
| D-09-5 | Pemilih periode monitoring hanya satu opsi (30 hari) | opsi lain tidak ada di sumber | Dipertahankan |
| D-09-6 | Moderasi hanya berlaku untuk konten milik demo user (author `USR-DEMO-*` di-seed ulang saat versi seed berubah) | perilaku `migrateDemoSeeds` P07 | Dipertahankan; diuji dengan balasan milik `USR-PMB-0042` |
| D-09-7 | Panel "Mode Demo" (state normal/kosong/gagal) ada di halaman produk | markup sumber | Dipertahankan; berguna untuk P11 |

## 8. Batasan frontend-only

Tidak ada autentikasi admin nyata, middleware peran, query DB, pembayaran, atau mutasi produksi. Semua keputusan
moderasi/pencairan hanya menulis state browser. Login admin **tidak** mengklaim keamanan: halaman menyatakan bahwa
autentikasi belum tersedia dan hanya menyediakan pratinjau dashboard dengan penanda sesi demo.

## 9. Untuk fase berikutnya (P10/P11)

- **P10**: gunakan `resources/data/ikapi/{admin,publisher,books,community-seed}.json` yang sama; jangan membuat
  dataset baru. Route `admin.*` dan `publisher.*` sudah bernama sesuai `Navigation.php`.
- **P11**: resep state "Mode Demo" di 8 halaman admin bisa dipakai sebagai matriks regresi; `divide-y` dan
  `--color-white` inline sekarang global, jadi jalankan ulang baseline P02/P05–P08 untuk memastikan tidak ada
  halaman lain yang bergantung pada perilaku lama.
- Moderasi diskusi: kebijakan "hapus induk, anak tetap" sudah sesuai sumber (placeholder + anak hidup). Bila pemilik
  ingin kebijakan lain (hapus berantai), itu pekerjaan terpisah.

## 10. Status acceptance gate

| Kriteria | Status | Bukti |
|---|---|---|
| Semua halaman unik Admin tercover sesuai inventory P01 | **Lulus** | 9 Blade + 9 route (§1) |
| Sidebar/header/dashboard/tabel/drawer visual sesuai baseline | **Lulus** | §4: 5 viewport, hampir semua 0 px; sisa ≤0,07% rasterisasi |
| Aksi moderator menyasar data yang benar; tidak ada laporan lintas tipe tercampur | **Lulus** | §5 skenario 4 & 8 (target `RPL-P09-P`, status `removed`, anak hidup) |
| Shared state bekerja bersama demo Buyer/Publisher di satu origin | **Lulus** | §5 skenario 7 (direktori pembeli melihat komunitas baru) dan 8 (thread pembeli menampilkan placeholder) |
| Tidak ada auth admin/DB/payment/mutasi produksi | **Lulus** | §8, tidak ada `Auth::`, tidak ada gateway, tidak ada query DB |
| Tidak ada perbedaan visual tak dijelaskan, rute/aset rusak | **Lulus** | 404 aset 0; semua route 200; error JS hanya D-09-1 (cacat sumber) |

Verifikasi: `node docs/migration/tools/p9-parity.mjs` (9 halaman × 5 viewport), `p9-flows.mjs` (9 skenario),
`p9-extract.mjs`/`p9-build.py`/`p9-fixtures.mjs` (regenerasi dari sumber). `phpstan` 0 error, `pint --test` lulus,
`npm run build` lulus, `php artisan view:cache` lulus, 9 route `admin.*`.