# P01 - Blueprint Arsitektur Migrasi HTML -> Blade

Fase: **P01 (audit/read-only)**. Tidak ada application code yang diubah oleh dokumen ini.
Pasangan dokumen: `docs/migration/p1-inventory.md` (inventaris 45 file, coverage 100%).

Target stack yang dipakai apa adanya dari repo: **Laravel 13 + Blade + Tailwind CSS 4.3.5 via Vite 6 + JavaScript vanilla**. Alpine 3.14.8 sudah terpasang tetapi **0 pemakaian** di prototype (0 atribut `x-data`/`@click`/`x-show`) sehingga belum perlu diaktifkan; JS prototype memakai IIFE + `addEventListener` (**450** pemanggilan: admin 179, penerbit 111, user 160) dan **218 handler inline `on*`** yang semuanya ada di **18 dari 22 halaman user** (portal penerbit/admin: 0). Tidak ada Bootstrap, React, Vue, Inertia, Livewire, atau template dashboard baru yang dibutuhkan.

---

## 1. Dependency graph sederhana

```
                        ┌──────────────────────────────┐
                        │  layouts/app.blade.php        │  (Publik: nav buyer + footer hitam)
                        │  layouts/publisher.blade.php  │  (shell: banner SVG + sidebar 248px)
                        │  layouts/admin.blade.php      │  (shell sama, menu berbeda)
                        │  layouts/auth-demo.blade.php  │  (tanpa navbar, panel ilustrasi)
                        └──────────────┬───────────────┘
                                       │  @extends
   ┌───────────────────────────────────┼────────────────────────────────────────────┐
   │                                   │                                            │
 buyer/*                          auth-demo/*                                   publisher/* , admin/*
   │                                   │                                            │
   ├─ home ──► catalog ──► book-detail ──► cart ──► orders                        ├─ dashboard
   │             │             │            (statis)   │                            ├─ books
   │             │             ├─► book-preview ─► reader                          ├─ orders
   │             │             └─► (laporan buku) ──┐                              ├─ payouts
   │             ├─ agenda ──► agenda-detail        │                              ├─ reviews
   │             └─ community (5 subview)           │                              ├─ settings
   │                                                │                              └─ invoice
   ├─ profile ◄─► settings, help, reviews, library  │
   └─ chatbot (widget global)                       │
                                                    ▼
                              admin/catalog, admin/review-moderation
                              (antrean laporan: konsumen data yang BELUM tersambung di prototype)

   partials (dipakai lintas layout):
     header-buyer (varian: beranda | akun | agenda | chatbot | komunitas), footer-buyer,
     header-publisher-admin (6 varian), sidebar-publisher, sidebar-admin,
     book-card, empty-state, toast, modal/drawer shell, pagination, table-shell
```

Bentuk nyata di prototype saat ini: navigasi antarhalaman berupa **anchor statis** (`href="*.html"`), bukan router. 0 `history.pushState`, 0 `popstate`, 0 `hashchange` (hanya 1 pemakaian `history` di login/register untuk membersihkan query). Karena itu Back/Refresh/URL langsung harus dibangun ulang sebagai perilaku route Blade, bukan dipertahankan dari JS.

### 1.1 Graf halaman terukur (in/out degree, 38 halaman)

- Halaman dengan in-degree tertinggi: `masuk_login` (18), `beranda` (16), `chatbot_bantuan` (14), `katalog` (14), `agenda_berita_literasi` (13), `keranjang` (13), `komunitas` (13), `perpustakaan_saya` (10).
- Halaman paling terisolasi: `detail_agenda` (1), `preview_buku` (1), `web_reader` (1), `invoice_penjualan` (1), `verifikasi_email` (0), `pendaftaran_penerbit` (0).
- Klaster akun buyer = 6 halaman dengan sidebar off-canvas identik (`akun_saya_profil`, `bantuan_akun`, `pengaturan_akun`, `perpustakaan_saya`, `riwayat_pesanan`, `riwayat_ulasan`) - kandidat partial terkuat.
- 3 tepi lintas persona: `admin/login -> user/lupa_kata_sandi`, `penerbit/masuk_portal -> user/masuk_login`, `penerbit/pendaftaran -> user/daftar_akun`.

---

## 2. Route matrix usulan

Konvensi: frontend-only, semua route mengembalikan Blade + dummy fixture. Tidak ada middleware auth nyata, tidak ada query database. ID memakai slug stabil dari fixture, bukan angka acak.

### 2.1 Publik / buyer

| URL | Named route | View Blade | Controller | Sumber HTML | Query & perilaku |
|---|---|---|---|---|---|
| `/` | `home` | `buyer.home` | Closure/`HomeController@index` | `user/beranda_desktop.html` | - |
| `/katalog` | `catalog` | `buyer.catalog` | `CatalogController@index` | `user/katalog_buku_desktop.html` | `?q=`, `?kategori=`, `?urut=` dipertahankan di URL (filter client-side boleh, tapi state harus ada di URL) |
| `/buku/{slug}` | `book.show` | `buyer.book-detail` | `CatalogController@show` | `user/detail_buku_desktop.html` | **baru**: menerima `{slug}`; slug tak dikenal -> `abort(404)` + view `errors.404` |
| `/buku/{slug}/preview` | `book.preview` | `buyer.book-preview` | `CatalogController@preview` | `user/preview_buku_desktop.html` | **baru** (prototype tidak mengirim ID) |
| `/buku/{slug}/baca` | `reader` | `buyer.reader` | `CatalogController@read` | `user/web_reader_desktop.html` | `?halaman=` opsional |
| `/keranjang` | `cart` | `buyer.cart` | `CartController@index` | `user/keranjang_pembayaran_terpadu_desktop.html` | - |
| `/keranjang/pembayaran` | `cart.payment` | `buyer.cart-payment` | `CartController@payment` | (sama, snap overlay) | Status pembayaran = 4 state terpisah, bukan modal tunggal |
| `/riwayat-pesanan` | `orders` | `buyer.orders` | `OrderController@index` | `user/riwayat_pesanan_desktop.html` | `?status=` |
| `/perpustakaan` | `library` | `buyer.library` | `LibraryController@index` | `user/perpustakaan_saya_desktop.html` | `?tab=all\|reading\|unread\|favorite` (sudah dibaca prototype, belum pernah dikirim) |
| `/ulasan-saya` | `reviews` | `buyer.reviews` | `ReviewController@index` | `user/riwayat_ulasan_desktop.html` | - |
| `/agenda` | `agenda` | `buyer.agenda` | `AgendaController@index` | `user/agenda_berita_literasi_desktop.html` | `?tab=agenda\|berita` |
| `/agenda/{id}` | `agenda.show` | `buyer.agenda-detail` | `AgendaController@show` | `user/detail_agenda_desktop.html` | sudah `?id=ev-N`; pindah ke path param + 404 |
| `/komunitas` | `community` | `buyer.community` | `CommunityController@index` | `user/komunitas_literasi_desktop.html` | `?komunitas=`, `?topik=`, `?balas=` (deep link sudah ada, pertahankan sebagai query agar kompatibel) |
| `/bantuan` | `help` | `buyer.help` | `HelpController@index` | `user/bantuan_akun_desktop.html` | - |
| `/bantuan/chatbot` | `chatbot` | `buyer.chatbot` | `HelpController@chatbot` | `user/chatbot_bantuan_rekomendasi_desktop.html` | widget global di semua halaman buyer |
| `/profil` | `profile.show` | `buyer.profile` | `ProfileDemoController@show` | `user/akun_saya_profil_dropdown_navigasi_desktop.html` | - |
| `/pengaturan` | `profile.settings` | `buyer.settings` | `ProfileDemoController@edit` | `user/pengaturan_akun_desktop.html` | - |
| `/onboarding` | `onboarding` | `buyer.onboarding` | `OnboardingController@index` | `user/onboarding_preferensi_bacaan_desktop.html` | 4 langkah tetap di satu route (state di klien) |

### 2.2 Auth demo (tanpa auth nyata)

| URL | Named route | View | Sumber | Query & perilaku |
|---|---|---|---|---|
| `/masuk` | `login` | `auth-demo.login` | `user/masuk_login_desktop.html` | `?role=buyer\|publisher`, `?next=` (sudah ada allow-list `safeNext()`: hanya `[a-z0-9_-]+.html`; di Blade ganti menjadi allow-list nama route) |
| `/daftar` | `register` | `auth-demo.register` | `user/daftar_akun_register_desktop.html` | `?role=buyer\|publisher`; alur penerbit 3 langkah |
| `/lupa-sandi` | `password.request` | `auth-demo.forgot-password` | `user/lupa_kata_sandi_desktop.html` | `?role=` |
| `/verifikasi-email` | `verification.notice` | `auth-demo.verify-email` | `user/verifikasi_email_desktop.html` | `?email=`; tetap yatim kecuali ditautkan dari register (keputusan pemilik) |
| `/status-pendaftaran` | `publisher.status` | `buyer.publisher-status` | `user/status_pendaftaran_penerbit_desktop.html` | `?akses=blokir`, `?sesi=aktif` |
| `/masuk-penerbit` | `publisher.login` | redirect -> `login?role=publisher` | `penerbit/masuk_portal_penerbit_desktop.html` | `Route::redirect` |
| `/daftar-penerbit` | `publisher.register` | redirect -> `register?role=publisher` | `penerbit/pendaftaran_penerbit_desktop.html` | `Route::redirect` |

### 2.3 Portal penerbit (prefix `/penerbit`)

| URL | Named route | View | Sumber |
|---|---|---|---|
| `/penerbit` | `publisher.dashboard` | `publisher.dashboard` | `dashboard_penerbit_desktop.html` |
| `/penerbit/buku` | `publisher.books` | `publisher.books` | `kelola_buku_desktop.html` |
| `/penerbit/pesanan` | `publisher.orders` | `publisher.orders` | `pesanan_masuk_desktop.html` |
| `/penerbit/pencairan` | `publisher.payouts` | `publisher.payouts` | `pendapatan_dan_pencairan_desktop.html` |
| `/penerbit/ulasan` | `publisher.reviews` | `publisher.reviews` | `ulasan_pembeli_desktop.html` |
| `/penerbit/profil` | `publisher.settings` | `publisher.settings` | `pengaturan_profil_desktop.html` |
| `/penerbit/invoice/{nomor}` | `publisher.invoice` | `publisher.invoice` | `invoice_penjualan_pdf_portal_penerbit.html` |

### 2.4 Portal admin (prefix `/admin`)

| URL | Named route | View | Sumber |
|---|---|---|---|
| `/admin/masuk` | `admin.login` | `admin.login` | `login_administrator_desktop.html` (`?akses=blokir`) |
| `/admin` | `admin.dashboard` | `admin.dashboard` | `dashboard_administrasi_utama_desktop.html` |
| `/admin/pengguna` | `admin.users` | `admin.users` | `kelola_pengguna_desktop.html` |
| `/admin/katalog` | `admin.catalog` | `admin.catalog` | `pengawasan_katalog_buku_global_desktop.html` |
| `/admin/moderasi-ulasan` | `admin.review-moderation` | `admin.review-moderation` | `moderasi_ulasan_dan_komentar_desktop.html` |
| `/admin/monitoring` | `admin.monitoring` | `admin.monitoring` | `monitoring_global_desktop.html` |
| `/admin/pencairan` | `admin.payouts` | `admin.payouts` | `kelola_pencairan_dana_desktop.html` |
| `/admin/komunitas` | `admin.communities` | `admin.communities` | `kelola_komunitas_desktop.html` |
| `/admin/moderasi-diskusi` | `admin.discussion-moderation` | `admin.discussion-moderation` | `moderasi_diskusi_komunitas_desktop.html` |

### 2.5 Aturan route yang mengikat

1. **Named route untuk semua tautan**; tidak ada `href="*.html"` di Blade. `route()` dipakai di nav, kartu, breadcrumb, tombol modal.
2. **Slug/ID**: buku `{slug}` (mis. `laskar-aksara-pasundan`), agenda `{id}` (`ev-1`), komunitas/topik/balasan sebagai query `?komunitas=community-filologi&topik=TPC-2026-101&balas=RPL-...` karena deep link sudah ada dan dipakai lintas halaman.
3. **Not-found valid**: `book.show`, `agenda.show`, `publisher.invoice` harus punya jalur 404 (prototype hanya menyediakan state "tidak ditemukan" untuk agenda dan komunitas).
4. **Direct URL refresh** harus bekerja: setiap halaman berdiri sendiri (tidak boleh bergantung pada state halaman sebelumnya) - konsekuensi: fixture harus cukup untuk render awal. Perhatikan `perpustakaan?tab=` yang saat ini hanya jalan kalau query dikirim.
5. **Browser Back**: tidak boleh mengandalkan `location.replace` (dipakai guard & redirect alias). Guard demo pindah ke middleware `web` dengan redirect `302` + flash message, sehingga Back tetap masuk akal.

---

## 3. Struktur folder usulan (proposal, belum dibuat)

```
resources/views/
├── layouts/
│   ├── app.blade.php              (buyer: header + footer hitam #111111)
│   ├── auth-demo.blade.php        (tanpa nav; panel ilustrasi)
│   ├── publisher.blade.php        (banner SVG + sidebar 248px + workspace -mt-20)
│   └── admin.blade.php            (shell sama, menu admin)
├── components/                    (hanya yang benar-benar berulang; lihat bagian 4)
│   ├── nav-buyer.blade.php  nav-portal.blade.php  sidebar-portal.blade.php
│   ├── footer.blade.php     footer-compact.blade.php
│   ├── book-card.blade.php  empty-state.blade.php  toast.blade.php
│   ├── modal.blade.php      drawer.blade.php       table-shell.blade.php
│   └── status-text.blade.php  (badge status = teks berwarna, tanpa bg/border - perilaku final prototype)
├── partials/                       (potongan halaman, bukan komponen publik)
│   ├── buyer/ (home-hero, home-shelf, catalog-filters, book-detail-*, cart-*, library-*, agenda-*)
│   ├── community/ (hero, directory, profile, room, thread, composer, report)
│   ├── publisher/ (kpi, chart, table, drawer, modal)
│   └── admin/ (kpi, queue, drawer, modal, chart)
├── buyer/  auth-demo/  publisher/  admin/
└── errors/404.blade.php

resources/css/
├── app.css                        (tailwindcss + @theme hasil konsolidasi 11 config)
└── ikapi/
    ├── tokens.css                 (peta token warna/font/radius)
    ├── reader-theme.css           (variabel tema web reader + dark mode)
    ├── thread.css                 (connector Threads-style; grid avatar rail 36px)
    └── scrollbar.css              (scrollbar-none + 2 CSS khusus lain)

resources/js/
└── ikapi/
    ├── app.js                     (bootstrap Alpine hanya bila dipakai)
    ├── chatbot-widget.js          (dari user/chatbot-widget.js, global ikapiChat*)
    ├── guards/access-guard.js     (diganti middleware; file disimpan sebagai referensi)
    ├── guards/admin-guard.js
    ├── buyer/{catalog,book-detail,cart,library,reader,reviews,agenda,onboarding}.js
    ├── community/{community,thread,composer,report}.js
    ├── publisher/*.js   admin/*.js
    └── data/                      (fixture JSON/JS; 1 owner per fixture)

public/assets/ikapi/
├── covers/ (27 nama; 12 dipakai katalog)   ├── events/ (7)
├── banner-hero/ + banners/                 ├── ilustration-pakai/ (yang dipakai)
└── logo/ (logo-ikapi-jabar.png, favicon)
```

Aturan aset: **HTML asli + `docs/design/assets/` tetap utuh**; hanya aset yang dipakai dipublikasikan ke `public/assets/ikapi/`. Dari 76 aset, **41 dipakai prototype** dan 35 belum dipakai (daftar lengkap di `p1-inventory.md` lampiran aset / hasil audit). Nama aset yang punya **spasi dan huruf besar** (`ilustration/Back-to-Back Reading Companions.png`, `ilustration/Woman Reading on Stacked Books.png`, `banner-hero/Dari Penerbit Jawa Barat.png`, `banner-hero/Screenshot ...png`) harus di-slug-kan saat dipublikasikan; HTML asli tidak diubah.

---

## 4. Shared component plan (berbasis pengukuran, bukan tebakan)

Keluarga blok nyata dari analisis struktur HTML:

| Blok | Keluarga terukur | Komponen usulan | Variasi |
|---|---|---|---|
| `<header>` | 17 keluarga / 42 blok | `nav-buyer` (varian: `beranda`, `akun`, `agenda`, `chatbot`, `komunitas`, `minimal`), `nav-portal` | Menu aktif, ada/tidak dropdown akun, ada/tidak search, badge keranjang |
| `<aside>` | 25 keluarga / 30 blok | `sidebar-portal` (admin/penerbit), `sidebar-akun-buyer` | Menu berbeda; breakpoint berbeda (admin/penerbit: tombol menu + drawer; buyer: off-canvas 6 halaman) |
| `<footer>` | 7 keluarga / 25 blok | `footer` (besar, buyer), `footer-compact` (portal) | - |
| Kartu buku | 4 markup berbeda (katalog grid, rak beranda, terkait, chatbot) | `book-card` | `grid`, `shelf`, `compact`, `link-only` |
| Modal/drawer | **19 halaman** memakai `role="dialog"` (18 juga `aria-modal`); **8 halaman** memakai panel bergaya drawer (6 portal + keranjang + web reader) | `modal`, `drawer` | Fokus trap, `Escape`, klik overlay, return focus |
| Toast | **24 halaman** | `toast` | sukses/gagal/info; id berbeda-beda di prototype (`toast`, `toast-notification`, `cart-toast`, `reader-toast`, dst.) -> 1 komponen |
| Tabel + filter | **11 halaman** ber-`<table>` (10 portal + invoice); `overflow-x-auto` ada di 24 halaman | `table-shell` + `filter-bar` | Kolom berbeda; pola scroll horizontal + kartu seluler harus dipertahankan |
| Empty/error/loading | **28 halaman** punya id state (`empty`, `noresults`, `error`, `loading`, `skeleton`) | `empty-state` | 5 bentuk state; wajib tetap dapat dipicu |
| Status | 10+ halaman | `status-text` | teks berwarna `#0F7B4F`/`#B42318`/muted, **tanpa bg/border** |
| Pagination | **8 halaman** (4 admin, 3 penerbit, 1 katalog); 3 halaman lain memakai pola teks "Halaman X dari" | `pagination` | Jumlah halaman + kontrol prev/next |

Yang **tidak** dijadikan komponen: setiap `div`/`section` halaman, hero, KPI card (angkanya beda-beda dan bukan abstraksi), dan panel chart.

---

## 5. Kontrak data & state (frontend-only)

### 5.1 Fixture: satu owner per data

| Fixture | Isi | Owner tunggal | Dipakai halaman |
|---|---|---|---|
| `data/books.*` | 12 buku (id `B01`-`B12`, judul, penulis, kategori, penerbit, harga, cover, tahun) | `CatalogController`/config | katalog, beranda, detail, preview, reader, terkait |
| `data/book-detail.*` | 1 detail buku `BK-01` + sinopsis + ulasan + terkait | partial `book-detail` | detail buku |
| `data/agenda.*` | `eventsData` (3 agenda `ev-1..3`) + `articlesData` + `icsData` | `AgendaController` | agenda, detail agenda, beranda |
| `data/community.*` | 3 komunitas (`community-filologi`, `community-klub-buku`, dst: id, name, focus, focusLabel, location, shortDesc, fullDesc, photo) | `CommunityController` | komunitas, admin/kelola komunitas |
| `data/community-topics.*` | topik seed `TPC-2026-101..` (id, communityId, title, body, authorId, authorName, createdAt, updatedAt, removed) | `CommunityController` | komunitas, moderasi diskusi |
| `data/community-replies.*` | balasan + `parentReplyId` (kedalaman maks 2, lebih dalam diratakan dengan label "Membalas [Nama]") | `CommunityController` | komunitas, moderasi diskusi |
| `data/orders.*` | `ordersData` (11 item) | `OrderController` | riwayat pesanan, dashboard penerbit, monitoring |
| `data/payouts.*` | pencairan (status `proses`/`selesai`/`ditolak`) | `PayoutController` | pendapatan penerbit, kelola pencairan |
| `data/users.*` | pengguna + status (`pending`/`all`) | `AdminController` | kelola pengguna, moderasi |
| `data/reports.*` | laporan ulasan/komentar (`A`-`G` kategori) | `ModerationController` | moderasi ulasan, pengawasan katalog |
| `data/faq.*` | 8 item FAQ | `HelpController` | bantuan |
| `data/onboarding.*` | kategori + langkah | `OnboardingController` | onboarding |

### 5.2 Persistensi demo (localStorage) - 21 key, owner ditetapkan

| Key | Penulis (saat ini) | Pembaca | Rencana |
|---|---|---|---|
| `ikapi_buyer_session_demo` | `user/masuk_login` | `admin-guard.js`, komunitas (hapus) | 1 pemilik: auth-demo session service |
| `ikapi_admin_session_demo` | `admin/login_administrator` | `admin-guard.js` | 1 pemilik, dibaca guard |
| `ikapi_publisher_application_demo` | `user/daftar_akun_register` | `access-guard.js`, `status_pendaftaran` | 1 pemilik |
| `ikapi_publisher_status_preview` | `status_pendaftaran` (dan dihapus register) | `status_pendaftaran` | pratinjau mode demo, terpisah dari data pengajuan |
| `ikapi_user_profile` | `akun_saya_profil`, `pengaturan_akun` | 6 halaman | **konflik: 2 penulis** -> jadikan 1 service |
| `ikapi_user_preferences` | `pengaturan_akun` | - | 1 pemilik |
| `ikapi_reading_prefs_demo` | `onboarding` | - | 1 pemilik |
| `ikapi_rating_laskar_aksara` | `detail_buku`, `riwayat_ulasan` | keduanya | **konflik: 2 penulis** (buku tunggal) |
| `ikapi_user_review_history` | `riwayat_ulasan` | - | 1 pemilik |
| `ikapi_book_reports_demo` | `detail_buku` | **tidak ada pembaca** | antrean admin belum tersambung |
| `ikapi_comment_reports_demo` | `detail_buku` | **tidak ada pembaca** | idem |
| `ikapi_comment_reactions_demo` | `detail_buku` | - | reaksi komentar |
| `ikapi_reader_settings` / `ikapi_reader_bookmarks` / `ikapi_reader_pos_laskar_aksara` | `web_reader` | - | 3 key pembaca |
| `ikapi_communities_demo` | komunitas (seed) + admin/kelola komunitas | komunitas, admin, moderasi diskusi | **2 penulis**; seed punya versi |
| `ikapi_community_topics_demo` | komunitas + admin/moderasi diskusi | 3 halaman | **2 penulis** |
| `ikapi_community_replies_demo` | komunitas + admin/moderasi diskusi | 2 halaman | **2 penulis** |
| `ikapi_community_memberships_demo` | komunitas | - | 1 pemilik |
| `ikapi_discussion_reports_demo` | komunitas + admin/moderasi diskusi | 2 halaman | **2 penulis** |
| `ikapi_community_seed_version` | komunitas | - | migrasi seed (self-healing) |

Aturan: **satu modul memiliki setiap key**, ditulis ke `resources/js/ikapi/data/*-store.js`; halaman hanya memanggil API modul (`readTopics()`, `saveTopics()`), tidak menyentuh `localStorage` langsung. Key yang saat ini punya 2 penulis (5 key) disatukan sebelum P02 menyalin halaman.

### 5.3 Koneksi antarhalaman yang **tidak ada** di prototype (jangan dikarang)

| Alur | Kondisi nyata | Kontrak tiruan yang diusulkan |
|---|---|---|
| Katalog/beranda -> detail buku | semua tautan `detail_buku_desktop.html` tanpa parameter; halaman detail selalu buku `BK-01` | route `book.show` dengan `{slug}`; fixture 12 buku; kartu mengirim slug |
| Detail buku -> keranjang | tombol "Tambah ke Keranjang" hanya toast, tidak menulis storage; keranjang berisi 2 item hard-code | `cart-store.js` (menulis item ke localStorage/session), badge header membaca jumlahnya |
| Checkout -> riwayat pesanan | keranjang tidak menulis apa pun; riwayat memakai `ordersData` statis | `orders-store.js`; aksi "Bayar" (status sukses) menambah 1 pesanan demo |
| Perpustakaan -> reader | perpustakaan memakai `STORAGE_KEY` sendiri; reader memakai `ikapi_reader_*` berbeda | `library-store.js` + posisi baca per buku |
| Riwayat ulasan <-> detail buku | keduanya menulis key rating yang sama (buku tunggal) | `reviews-store.js` per `bookId` |
| Laporan buku/komentar -> antrean admin | `ikapi_book_reports_demo`/`ikapi_comment_reports_demo` tidak dibaca admin mana pun (admin memakai `BASE_REPORTS` sendiri) | `reports-store.js` dibaca `admin.review-moderation` + `admin.catalog` |
| Laporan diskusi -> moderasi admin | key sama dipakai 2 penulis; status `pending`/`kept`/`removed` | `discussion-store.js` sebagai owner tunggal |
| Pengajuan penerbit -> persetujuan admin | status hanya di localStorage peramban; admin tidak membaca | tetap demo terpisah; didokumentasikan sebagai simulasi |

### 5.4 Guard demo -> middleware

| Sekarang | Nanti |
|---|---|
| `penerbit/access-guard.js` (7 halaman, blokir jika status != approved, tanpa storage = lolos) | middleware `web` grup `/penerbit` + cek status demo dari session; perilaku "tanpa session = lolos" **dipertahankan** untuk reviewer |
| `admin/admin-guard.js` (8 halaman, buyer diblokir, tanpa session = lolos) | middleware grup `/admin` + route `admin.login?akses=blokir` |
| `ikapi_admin_session_demo` pratinjau | session flash + tombol pratinjau di halaman login admin |

---

## 6. Strategi styling: Tailwind 3 CDN -> Tailwind 4 Vite

### 6.1 Fakta terverifikasi (dibuktikan dengan kompilasi, bukan asumsi)

- Prototype memuat `https://cdn.tailwindcss.com` di **38 halaman**; isi CDN adalah **Tailwind 3.4.17** (`cdn.tailwindcss.com` menyematkan `version:"3.4.17"`).
- Repo memakai **Tailwind 4.3.5** (`node_modules/tailwindcss/package.json`) via `@tailwindcss/vite`, dengan `@plugin "@tailwindcss/forms"` dan `@source` hanya ke Blade pagination. **Tidak ada** `@source` ke `docs/`; jadi class prototype tidak masuk build kecuali disalin ke Blade/JS, yang memang rencananya begitu.
- **9 varian `tailwind.config` berbeda** di 40 HTML (2 redirect sama sekali tanpa config, jadi 38 file berconfig). 3 varian dominan (32 dari 38 file):
  - `c3a96dda`-setara (**13 file admin + penerbit**): token datar `primary`, `primary-hover`, `primary-deep`, `canvas`, `soft`, `neutral`, `ink`, `muted`, `border`, `divider` + radius `xl:12px`, `2xl:16px`, `3xl:20px`.
  - **16 file user**: token bersarang `primary.{DEFAULT,hover,deep,container,accent}`, `surface.{DEFAULT,soft,neutral,border}`, `ink.{body,muted,subtle}`, `border-subtle`, `border-bold` + `darkMode:"class"` + radius `2xl/3xl/4xl`.
  - **3 file auth** (`login`, `register`, `status_pendaftaran`): subset `primary.{DEFAULT,hover,deep}`, `surface`, `ink`, `border-subtle`.
  - Sisanya **6 config satu-file**: `admin/login_administrator`, `penerbit/dashboard_penerbit` (+`violet-dark`, `violet-light`, `blue-accent`), `penerbit/invoice` (+`viewer`), `user/onboarding`, `user/preview_buku`, `user/web_reader` (memakai `container`, `fontFamily`, `borderRadius`).
- Dari **1.016 token kelas unik** di 40 halaman: **840 token adalah utilitas Tailwind stock** (dihasilkan oleh v3 CDN maupun v4) dan **176 token sisanya bergantung pada `theme.extend` per halaman atau CSS khusus** sehingga **wajib dipetakan ke `@theme` v4**: token warna (`bg-primary`, `text-ink`, `border-divider`, `bg-soft`, `bg-canvas`, `hover:bg-primary-hover`, `divide-divider`, `accent-primary`, `selection:bg-primary-soft`), utilitas kustom (`focus-ring`, `focus-ring-light`, `shell-main`, `banner-bleed`, `invoice-sheet`, `no-print`, `animate-in`, `fade-in`, `scrollbar-none`, `backdrop-blur-xs`, `w-46`), dan hook JS/state (`demo-item`, `demo-check`, `tab-btn`, `tab-count`, `is-open`, `period-btn`, `filter-btn`, `filter-count`, `preset-btn`, `scenario-chip`, `event-card`, `card`, `loading`, `pending`, `create`).
- `rounded-3xl` hampir eksklusif user (50 pemakaian vs 1 admin, 0 penerbit) - konsisten dengan config yang berbeda. `rounded-4xl` 0 pemakaian.

### 6.2 Perbedaan perilaku v3 (CDN) vs v4 (repo) yang harus diamankan

| Kelas/pola | v3 (CDN, sekarang tampil) | v4 (repo, nanti) | Dampak & mitigasi |
|---|---|---|---|
| `border` tanpa warna | preflight `border-color: #e5e7eb` | `border: 0 solid` + warna `currentcolor` | **terbukti 9 markup** memakai `border` tanpa `border-*` warna (1 admin login, 8 di web reader yang sudah punya `theme-border` custom). Mitigasi: `@layer base { *, ::before, ::after { border-color: var(--color-border); } }` (kompat v3) |
| `border`/`divide` (735 & 14 pemakaian) | warna default gray-200 | currentcolor | sama seperti di atas + `divide-color` default |
| `shadow-sm` (37 pemakaian, 21 file) | `0 1px 2px rgb(0 0 0/.05)` | `0 1px 3px rgb(0 0 0/.1), 0 1px 2px -1px ...` | lebih tebal; sudah diverifikasi; samakan lewat `@theme --shadow-sm` atau ganti ke `shadow-xs` |
| `outline-none` (129 pemakaian, 30 file) | `outline: 2px solid transparent` (menghapus outline) | `outline-style: none` (tidak sepenuhnya menghapus untuk forced-colors) | perilaku fokus beda; audit aksesibilitas saat konversi |
| `ring` (bare) | 3px biru-500 | 1px currentcolor | prototype memakai `ring-2`/`ring-primary/20`, jadi risiko rendah, tetap dicek |
| `placeholder::color` | `#9ca3af` | `currentcolor` (dengan `@supports` khusus) | placeholder bisa menyatu dengan teks; set `--color-*` placeholder atau kelas `placeholder:text-*` (sudah dipakai 3 halaman) |
| `cursor: pointer` pada `[role=button]` | ada di preflight | tidak ada | 218 handler inline di 18 halaman user bisa kehilangan kursor tangan; tambahkan `@layer base [role=button]{cursor:pointer}` + pindahkan handler ke modul JS |
| `container` | punya `padding` + `center: true` default | `container` = utility berbeda, tanpa center/padding default | dipakai 2 halaman (beranda, komunitas); ganti dengan `max-w-[1360px] mx-auto` sesuai baseline repo |
| `dark:` | `darkMode: "class"` di 18 file, tetapi hanya `web_reader` yang benar-benar memakai `dark:` (18 kemunculan, 1 file) | default v4 = `prefers-color-scheme` | pertahankan `dark` sebagai variant class untuk web reader |
| `shadow-[...]`, `min-w-[18px]`, `w-[min(92vw,420px)]`, dsb. | arbitrary values | sama | 1.120 token arbitrary unik (mis. `min-w-[18px]`, `w-[min(92vw,420px)]`, `h-[276px]`, `text-[13.5px]`, `shadow-[0_16px_40px_rgba(34,34,37,0.12)]`); aman, tetapi angka wajib disalin apa adanya |
| Kelas dibuat dinamis di JS | 1 file (`pengaturan_profil`, pola `'bg-' + x`) | v4 hanya memindai teks statis | wajib memakai daftar kelas utuh di source agar tidak ter-purge |

### 6.3 Konsolidasi tema

Satu `@theme` di `resources/css/app.css` menggabungkan: primer `#673DE6`/hover `#5025D1`/deep `#2F1C6A`, permukaan `#FFFFFF`/`#F5F6FF`/`#F5F5F6`, teks `#222225`/`#62636B`/`#9D9EA4`, border `#E5E7EB`/`#D1D5DB`/`#EFEFF2`, semantik hijau `#0F7B4F` & merah `#B42318`, radius 12/16/20px + `2xl` 1rem, dan font DM Sans. Nama token **penerbit/admin (datar)** dan **user (bersarang)** dipetakan ke satu set nama (`--color-primary`, `--color-primary-hover`, `--color-primary-deep`, `--color-surface`, `--color-surface-soft`, `--color-surface-neutral`, `--color-ink`, `--color-ink-muted`, `--color-border`, `--color-divider`) lalu kelas lama ditulis ulang saat konversi Blade; jangan mempertahankan dua skema nama.

Font & ikon: **DM Sans** di 38 halaman (dari Google Fonts), **Plus Jakarta Sans** muncul di 18 halaman (15 sebagai `family=` param, hanya 1 benar-benar memakai `font-family`), **Literata** khusus `preview_buku` + `web_reader`, **Material Symbols Outlined** di 38 halaman (2 macam URL varian). Rencana: hosting lokal (atau sistem font stack) + subset ikon; keputusan ditunda ke fase komponen, tetapi **tidak** boleh mengubah tampilan.

CSS khusus yang wajib dipindahkan (bukan Tailwind): connector thread komunitas (grid avatar rail 36px + garis 1px + elbow `border-bottom-left-radius: 12px`), scrollbar reader, variabel tema reader (`theme-*`), dan kelas utilitas kustom: `.focus-ring` (571 pemakaian di 501 atribut class pada 20 halaman), `.focus-ring-light` (56/42, 14 halaman), `.shell-main` (42/14, 14 halaman), `.banner-bleed` (42/14, 14 halaman), `.scrollbar-none` (54/18, 18 halaman), `.invoice-sheet` (8), `.no-print` (2), plus `.animate-in`/`.fade-in`. Setiap halaman punya blok `<style>` sendiri (**40 halaman, total 47 KB**; admin 12 KB, penerbit 11 KB, user 24 KB) dan **21 halaman** memuat `@media (prefers-reduced-motion: reduce)` yang harus dipertahankan. Overlay memakai `z-index` sampai `z-95` di 21 halaman, jadi urutan lapisan harus dipetakan sebelum komponen modal/drawer/toast dibuat.

---

## 7. Risiko dan mitigasi

| # | Risiko | Bukti | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | Tailwind 3 -> 4 mengubah nilai default | `shadow-sm`, `outline-none`, `ring`, warna border/divide, placeholder, cursor, `container` | Tampilan bergeser halus di banyak halaman | Lapisan `@layer base` kompat + `@theme` untuk shadow/ring; uji visual per komponen |
| R2 | 11 config terpisah, 2 skema nama token | 13 file datar vs 16 file bersarang | Halaman bisa kehilangan warna kalau kelas lama disalin apa adanya | Konsolidasi token sebelum menyalin halaman; larang `tailwind.config` per-halaman |
| R3 | File raksasa | `komunitas` 3.084 baris/144 KB; `detail_buku` 1.899; `web_reader` 916; `kelola_buku` 1.088 | Sulit dikonversi sekali jalan, rawan konflik | Pecah per partial + JS modul; satu halaman = satu fase |
| R4 | JS inline besar & 218 `onclick` inline | 18 dari 22 halaman user; 73 `innerHTML` di 28 halaman; 60 timer; 53 template literal berisi HTML | Sulit diuji, bentrok nama global (pernah terjadi di `chatbot-widget.js`) | Ekstrak ke `resources/js/ikapi/**`; hapus `onclick` inline; namespace `ikapi*` |
| R5 | 21 key localStorage, 5 key punya 2 penulis | `ikapi_user_profile`, `ikapi_rating_laskar_aksara`, `ikapi_communities/topics/replies`, `ikapi_discussion_reports` | State demo tidak konsisten antarhalaman | Satu modul store per key sebelum konversi halaman terkait |
| R6 | Koneksi antarhalaman tidak ada | katalog->detail tanpa ID; keranjang tidak menulis; laporan tidak dibaca admin | Alur bisnis tampak "rusak" saat dinavigasi | Mock contract tertulis (bagian 5.3) dan badge/angka turunan, tanpa mengklaim backend |
| R7 | `localStorage` gagal (mode privat) | helper sudah `try/catch` | Hilang state | Pertahankan pola `try/catch` + fallback fixture; jangan pernah gagal senyap pada aksi tulis (sudah diperbaiki di 1 tempat) |
| R8 | Guard berbasis JS bisa dilewati/di-skip | tanpa storage = lolos | Bukan masalah keamanan (frontend-only) tapi bisa menyesatkan | Pindahkan ke middleware; dokumentasikan sebagai simulasi, bukan otorisasi |
| R9 | 404 belum ada untuk buku/invoice | hanya agenda & komunitas punya state "tidak ditemukan" | URL salah menampilkan halaman kosong | Tambah `errors/404` + `abort(404)` |
| R10 | Aset bernama spasi/huruf besar & 35 aset belum dipakai | `ilustration/Back-to-Back Reading Companions.png`, `ilustration/Woman Reading on Stacked Books.png`, `banner-hero/Dari Penerbit Jawa Barat.png`, `banner-hero/Screenshot 2026-11-15 005252.png`, `hero_reading.png`, `banners/banner-1..3.jpg`, 21 ikon `ilustration/3d/*`, 8 `*.svg` | 404 di server Linux (case-sensitive) | Slug-kan saat publish; verifikasi 1:1 dengan daftar 41 aset terpakai; jangan hapus aset |
| R11 | Baseline defect: `perpustakaan?tab=` tidak pernah dikirim, verifikasi email yatim, `pendaftaran_penerbit` yatim, `<title>` 31 file memakai em dash, 1 titik tengah di PRD | hasil audit | Kebingungan saat migrasi | Catat sebagai baseline defect; **tidak** diperbaiki diam-diam; minta keputusan pemilik |
| R12 | `pint --test` gagal pada `tests/Pest.php` (`line_ending`) | worktree CRLF vs `.gitattributes` `eol=lf` | CI `composer lint:check` merah | Perbaiki sebagai pekerjaan terpisah yang disetujui (1 file, 1 baris), bukan bagian migrasi |
| R13 | Tidak ada `AGENTS.md`/`GRAPH_REPORT.md` | pencarian menyeluruh | Aturan kontribusi hanya dari prompt | Gunakan prompt P01-P11 + `docs/migration/*` sebagai aturan kerja |

---

## 8. Urutan prioritas dan pembagian pekerjaan P02-P11

Urutan dipilih berdasarkan ketergantungan: fondasi -> komponen bersama -> alur buyer -> portal -> lintas-peran.

| Fase | Lingkup | Keluaran yang harus ada | Prasyarat |
|---|---|---|---|
| **P02** | Fondasi: konsolidasi `@theme`, layout 4 varian, komponen nav/footer/sidebar/toast/empty-state/modal, `errors/404`, penghapusan `tailwind.config` per-halaman | `resources/css/ikapi/tokens.css`, 4 layout, ~12 komponen | Dokumen ini |
| **P03** | Auth demo + onboarding + status penerbit: `login`, `register`, `lupa-sandi`, `verifikasi-email`, `onboarding`, `status-pendaftaran` + 2 route redirect alias | 6 halaman Blade, session demo service, middleware pratinjau | P02 (layout `auth-demo`) |
| **P04** | Beranda + katalog + detail buku + preview + reader + kartu buku | 5 halaman + `books` fixture + `book.show` slug | P02, P03 (kartu buku) |
| **P05** | Keranjang + status pembayaran + riwayat pesanan + perpustakaan + riwayat ulasan + profil + pengaturan + bantuan | 7 halaman + `cart-store`, `orders-store`, `library-store`, `reviews-store` | P04 |
| **P06** | Komunitas (5 subview: direktori, profil, ruang, topik, balas) + widget chatbot global | 1-2 route + `community/*` modul + `thread.css` | P02, P05 |
| **P07** | Agenda + berita + detail agenda | 2 halaman + `agenda` fixture + `agenda.show` | P04 |
| **P08** | Portal penerbit (7 halaman + shell) | layout `publisher`, 7 halaman, middleware akses | P02, P05 |
| **P09** | Portal admin (8 halaman + shell) | layout `admin`, 8 halaman, middleware admin | P02, P06 (moderasi komunitas) |
| **P10** | Penyambungan lintas-peran: laporan buku/komentar/diskusi -> antrean admin, pengajuan penerbit -> status, cart -> orders | Store tunggal + 2 antrean membaca data yang sama | P08, P09 |
| **P11** | QA akhir: matrix state, viewport (360/768/1280/1560), keyboard/fokus, `?` deep link, 404, Back/Refresh | Laporan QA + daftar selisih visual yang disetujui | P03-P10 |

Gate antar-fase: (1) tidak ada `href="*.html"` tersisa; (2) `npm run build` hijau; (3) `php artisan test` hijau; (4) state `empty`/`error`/`loading` tiap halaman masih dapat dipicu; (5) deep link lama (`?komunitas=`, `?topik=`, `?balas=`, `?id=ev-N`, `?role=`, `?next=`, `?tab=`) tetap bekerja.

---

## 9. Masalah yang perlu diputuskan pemilik

1. **Branch `prototype` tidak ada** (lokal & remote). Bekerja di `prototype-only` (HEAD `f243012`, 20 commit di depan `main`, 0 di belakang). Perlu konfirmasi apakah harus dibuat branch `prototype` baru dari commit ini.
2. **Halaman mobile**: 30 file `*_mobile.html` sudah dihapus; salinan lama di `docs/design/stitch/` (read-only) memakai palet **lama** `#5956E9` dan **bukan** desain sekarang. Pertanyaan: canonical hanya desktop-responsif, atau mobile perlu direkonstruksi dari desain sekarang?
3. **Yatim**: `user/verifikasi_email_desktop.html` dan `penerbit/pendaftaran_penerbit_desktop.html` tidak ditautkan siapa pun. Tautkan dari register, atau biarkan sebagai route langsung?
4. **Baseline defect** `<title>` (31 file memakai em dash) dan 1 titik tengah di PRD: perbaiki di fase ini atau tinggalkan?
5. **`pint --test` gagal** pada `tests/Pest.php` (`line_ending`): izin memperbaiki (1 file) supaya CI hijau?
6. **`preview_buku`/`web_reader` memakai `?` = tidak ada**: apakah keduanya perlu route ber-ID (`/buku/{slug}/preview`, `/buku/{slug}/baca`) atau tetap halaman contoh tanpa parameter?

---

## 10. Readiness untuk P02

**READY**, dengan catatan berikut:

- Inventaris lengkap: **45/45 file** tercatat satu baris per file (38 halaman + 2 redirect + 3 script + 2 design doc), cek silang jumlah 0 selisih.
- Aset: 76 terinventaris, 41 terpakai, 0 referensi rusak, 0 tautan internal rusak.
- Fondasi Laravel terverifikasi jalan: `php artisan route:list` = 4 route (tanpa Breeze), `php artisan test` lulus 2/2, `phpstan` lulus level 7, `npm run build` sukses, `pint --test` **gagal 1 file** (lihat R12).
- Perbedaan Tailwind 3 CDN -> 4 repo sudah diukur dengan kompilasi nyata pada 5 halaman sampel (bukan perkiraan), termasuk daftar kelas yang rawan bergeser.
- Ketergantungan antarhalaman yang **tidak ada** di prototype sudah didaftar sebagai kontrak tiruan, bukan dikarang.

Syarat yang **belum** terpenuhi dan harus dibereskan sebelum/selama P02: (a) keputusan pemilik pada bagian 9, (b) konsolidasi 21 key localStorage menjadi modul store, (c) lapisan kompatibilitas border/outline/shadow Tailwind 4.
