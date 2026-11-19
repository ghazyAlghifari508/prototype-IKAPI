# P06 — Alur Pembeli Lanjutan: Auth demo, Akun, Checkout, Reader, Agenda, Bantuan

Fase: 17 halaman prototype → Blade, frontend-only. Prototype **tidak diubah** (`git status docs/design/prototype-copy` = 0,
`docs/design/assets` = 0). Bukti: `p6-parity.json` (screenshot + diff), `p6-interactions.json` (matriks 17 flow),
`baselines/p6/**` (PNG), `p6-source/**` (fragmen verbatim per halaman), tool di `docs/migration/tools/p6-*`.

## 1. Peta HTML target → view → route

| # | HTML sumber (docs/design/prototype-copy/user) | View Blade | Route (name) |
|---|---|---|---|
| A1 | `masuk_login_desktop.html` (482) | `auth-demo/login.blade.php` | `GET /masuk` (`login`) |
| A2 | `daftar_akun_register_desktop.html` (633) | `auth-demo/register.blade.php` | `GET /daftar` (`register`) |
| A3 | `lupa_kata_sandi_desktop.html` (249) | `auth-demo/forgot-password.blade.php` | `GET /lupa-kata-sandi` (`password.request`) |
| A4 | `verifikasi_email_desktop.html` (253) | `auth-demo/verify-email.blade.php` | `GET /verifikasi-email` (`verification.notice`) |
| A5 | `onboarding_preferensi_bacaan_desktop.html` (381) | `auth-demo/onboarding.blade.php` | `GET /onboarding` (`onboarding`) |
| A6 | `status_pendaftaran_penerbit_desktop.html` (419) | `auth-demo/publisher-status.blade.php` | `GET /status-pendaftaran-penerbit` (`publisher.status`) |
| B1 | `akun_saya_profil_dropdown_navigasi_desktop.html` (699) | `buyer/account/profile.blade.php` | `GET /akun/profil` (`profile.show`) |
| B2 | `pengaturan_akun_desktop.html` (771) | `buyer/account/settings.blade.php` | `GET /akun/pengaturan` (`profile.settings`) |
| B3 | `bantuan_akun_desktop.html` (701) | `buyer/account/help.blade.php` | `GET /akun/bantuan` (`help`) |
| C1 | `keranjang_pembayaran_terpadu_desktop.html` (910) | `buyer/checkout/cart.blade.php` | `GET /keranjang` (`cart`) |
| C2 | `riwayat_pesanan_desktop.html` (887) | `buyer/orders/index.blade.php` | `GET /akun/pesanan` (`orders`) |
| D1 | `perpustakaan_saya_desktop.html` (1089) | `buyer/library/index.blade.php` | `GET /akun/perpustakaan` (`library`) |
| D2 | `web_reader_desktop.html` (917) | `buyer/reader/show.blade.php` | `GET /akun/perpustakaan/{book}/baca` (`reader`) |
| D3 | `riwayat_ulasan_desktop.html` (819) | `buyer/reviews/index.blade.php` | `GET /akun/ulasan` (`reviews`) |
| E1 | `agenda_berita_literasi_desktop.html` (1199) | `buyer/agenda/index.blade.php` | `GET /agenda` (`agenda`) |
| E2 | `detail_agenda_desktop.html` (544) | `buyer/agenda/show.blade.php` | `GET /agenda/{event}` (`agenda.show`) |
| E3 | `chatbot_bantuan_rekomendasi_desktop.html` (944) | `buyer/help/chatbot.blade.php` | `GET /akun/bantuan/chatbot` (`help.chatbot`) |

Tambahan non-halaman: `app/Http/Controllers/AuthDemoController.php` (6 method) dan
`app/Http/Controllers/BuyerPagesController.php` (11 method) hanya mengembalikan view + fixture JSON.
Tidak ada query DB, tidak ada Auth/Midtrans/PDF/API.

Shell yang dipakai ulang dari P04: `layouts/public` (12 halaman), `layouts/auth` (4 halaman, bukan layout Breeze),
`layouts/plain` (baru: onboarding, status penerbit, reader). Header/footer tetap partial P04, dengan prop baru
yang **diukur** dari sumber, bukan selera:

| Prop baru | Alasan (terukur) |
|---|---|
| `identity_ids` | 6 halaman akun punya `id="header-avatar(-initials)"/header-user-name/dropdown-user-name/email/header-cart-badge/toggle-dropdown-btn/header-user-dropdown"` yang dipakai skrip halaman untuk sinkronisasi identitas |
| `cart_badge_empty` + `cart_count` | semua header publik di P06 menampilkan badge "2"; agenda butuh badge kosong |
| `account_pill` | tombol bulat "Akun Saya" hanya ada di keranjang + chatbot, tidak di agenda/akun |
| `nav_active_sm` | tab aktif beranda memakai `text-[14px]`, tab aktif agenda **tidak** (16px, 15px lebih lebar) — perbedaan asli prototype, direproduksi |
| `footer_variant` | prototype punya 4 komposisi footer; `partials/public/footer-agenda.blade.php` & `footer-chatbot.blade.php` dibuat dari fragmen sumber (2 halaman), sisanya identik dengan partial P04 |

## 2. Skema demo-state (frontend-only)

Namespace `ikapi_*`, semuanya digerakkan modul di `resources/js/ikapi/{p6,ikapi/demo}`. Tidak ada kredensial nyata,
tidak ada klaim keamanan; localStorage hanya menandai sesi demo.

| Key | Ditulis oleh | Dipakai | Bentuk |
|---|---|---|---|
| `ikapi_buyer_session_demo` | login (A1), `demo/session.js` | login, guard P04 | `{id, name, email, role, loggedInAt}` |
| `ikapi_publisher_application_demo` | register wizard (A2) | register, status penerbit | `{pubName, pubMember, pubAddress, pubPic, pubEmail, pubPhone, step, submittedAt}` |
| `ikapi_publisher_status_preview` | register, status penerbit | A2, A6 | `pending｜approved｜rejected｜rejected-empty` |
| `ikapi_reading_prefs_demo` | onboarding (A5) | beranda rekomendasi | `{categories[], styles[], duration, completed}` |
| `ikapi_user_profile` | profil (B1) | header, sidebar, 6 halaman akun | `{fullName, email, phone, avatarUrl, categories[]}` |
| `ikapi_user_preferences` | pengaturan (B2) | B2 | `{orderStatus, events, newBooks}` |
| `ikapi_user_review_history` | ulasan (D3) | D3, detail buku | `[{id, bookId, title, author, rating, comment, date}]` |
| `ikapi_reader_settings` | reader (D2) | D2 | `{theme, fontFamily, fontSize, lineHeight}` |
| `ikapi_reader_pos_laskar_aksara` | reader (D2) | D2 | `{pageIndex, chapter}` |
| `ikapi_reader_bookmarks` | reader (D2) | D2 | `[{page, chapter, label}]` |

Key P03/P05 (`ikapi_rating_*`, `ikapi_comment_reactions_demo`, `ikapi_book_reports_demo`,
`ikapi_comment_reports_demo`, keranjang/favorit) tetap; P06 tidak mereset apa pun (audit: 0 penulisan destruktif).
Sinkronisasi antar-tab tidak dijanjikan (tidak ada klaim realtime), state dibaca ulang saat halaman dimuat.

## 3. Sumber data (immutable fixture)

Dibuat `docs/migration/tools/p6-fixtures.mjs` yang membaca nilai dari halaman prototype hidup, bukan mengetik ulang:

| Fixture | Isi | Dipakai |
|---|---|---|
| `resources/data/ikapi/agenda.json` | 3 event + 3 artikel | `/agenda` |
| `resources/data/ikapi/agenda-detail.json` | 3 entri detail (`ev-1..ev-3`: rundown, pembicara, catatan) | `/agenda/{event}` |
| `resources/data/ikapi/orders-p6.json` | 5 pesanan (status success/pending/failed/expired) | `/akun/pesanan` |
| `resources/data/ikapi/reviews.json` | 2 ulasan awal | `/akun/ulasan` |
| `resources/data/ikapi/faq.json` | 8 FAQ | `/akun/bantuan` |
| `resources/data/ikapi/reader.json` | 4 halaman bacaan + 2 bookmark awal | `/akun/perpustakaan/{book}/baca` |
| `resources/data/ikapi/profile.json` | profil demo awal | B1/B2/B3 |

Halaman menerima data lewat `@json(...)` → `window.IKAPI_P6_DATA`, dan literal di skrip prototype diganti satu baris
(`const ordersData = window.IKAPI_P6_DATA.ordersData;`) sehingga **satu sumber** dan rendering tetap verbatim.

## 4. Matriks flow A–E (hasil nyata dari `p6-interactions.json`)

| Flow | Langkah yang diuji | Hasil |
|---|---|---|
| **A1a** login penerbit | tab Pembeli→Penerbit, chip demo `pending` → submit | heading "Masuk ke Portal Penerbit", panel "menunggu persetujuan" tampil, tidak ada sesi dibuat |
| **A1b** login pembeli | isi `pembeli@demo.ikapi.id` + `demo12345` (chip demo hanya memilih skenario) → submit | redirect `/akun/perpustakaan`, `ikapi_buyer_session_demo` = `{id:USR-PMB-0042, role:buyer}` |
| **A2** register penerbit | 3 langkah wizard (penerbit → PIC → kata sandi) + submit | label "Langkah 2 dari 3" → "Langkah 3 dari 3", submit → `/status-pendaftaran-penerbit`, `ikapi_publisher_application_demo` = `{name:"CV Aksara Jaya", status:"pending"}` |
| **A3** lupa kata sandi | isi email → kirim | banner sukses tampil setelah 1,2 s (tombol "Tautan Terkirim"), tidak ada email dikirim |
| **A4** verifikasi email | `?email=` → tampil → kirim ulang | email tampil, feedback + toast muncul setelah 1,2 s |
| **A5** onboarding | 4 langkah (kategori → gaya → durasi → selesai) | semua panel berpindah, `ikapi_reading_prefs_demo` = `{categories:["sastra"],styles:["ringan"],duration:"lt15",completed:true}` |
| **A6** status penerbit | `?sesi=aktif`, chip "Disetujui" | label "Menunggu persetujuan" → "Disetujui", CTA berubah jadi "Masuk ke Dashboard" |
| **B1** profil | ubah nama → simpan → cek header & dropdown | `#header-user-name` ikut berubah, `ikapi_user_profile` tersimpan, dropdown terbuka |
| **B2** pengaturan | toggle switch + simpan, buka/tutup modal kata sandi | `{orderStatus:true,events:true,newBooks:true}` tersimpan, modal open/close (scroll lock, Escape) |
| **B3** bantuan | cari "pembayaran" → akordeon | 8 FAQ → 3 hasil, akordeon bisa dibuka |
| **C1** keranjang/checkout | 2 item, total, buka overlay pembayaran, pilih metode, status `berhasil` | overlay Snap-demo terbuka (tanpa gateway), `#status-berhasil` tampil |
| **C2** riwayat pesanan | 5 pesanan, filter Sukses, buka detail | 5 → 2 pesanan, modal `IKP-20261115-081` terbuka/tertutup |
| **D1** perpustakaan | tab Semua/Belum dibaca, cari "laskar" | hitungan tab `(3)/(1)/(2)/(2)`, 3 kartu terlihat |
| **D2** reader | halaman 41→42, drawer bookmark (+1), drawer tampilan, tema gelap | indikator "Halaman 42 (2 dari 4 di Bab 3)", penanda 2→3, tema diterapkan. **Tombol unduh: 0** |
| **D3** ulasan | buka edit, ubah komentar, submit form | modal tertutup, `ikapi_user_review_history` berisi komentar baru |
| **E1** agenda | 3 event + 3 artikel, klik tanggal 18, buka modal artikel | kalender memfilter, modal artikel buka/tutup |
| **E2** detail agenda | `/agenda/ev-1` | judul, kategori, tanggal 18 Nov 2026, 2 pembicara, 4 baris rundown |
| **E3** chatbot | kirim pesan lewat input | balasan skrip muncul ("Ada buku yang membahas sejarah dan naskah Sunda…"), tanpa request jaringan |

**18/18 flow lulus, 0 error JS, 0 respons ≥400** di seluruh matriks (login dipecah menjadi skenario penerbit dan pembeli).

## 5. Status paritas visual (screenshot diff, ambang 0)

Viewport 1440×900 dan 390×844, konteks browser baru per halaman, caret dinonaktifkan (blinking caret membuat diff
tidak deterministik — bukan bagian desain).

| Halaman | 1440×900 | 390×844 | Tinggi (blade/proto) |
|---|---|---|---|
| login, login-publisher | 0.000176 / 0 | 0.000352 / 0 | 900/900 |
| register, register-publisher | 0 | 0 | 917/917, 944/944 |
| forgot, verify | 0.00013 / 0 | 0.000495 / 0 | 900/900 |
| onboarding, publisher-status (+aktif) | 0 | 0 | 900/900, 849/849, 903/903 |
| profile, settings | 0 | 0 | 1371/1371, 1843/1843 |
| help | 0.000031 | 0 | 1694/1694 |
| cart | 0.000093 | 0.000201 | 1137/1137 |
| orders | 0 | 0 | 1953/1953 |
| library | 0.000406 | 0.000757 | 1673/1673 |
| reader | 0 | 0 | 1142/1142, 1815/1815 |
| reviews | 0 | 0 | 1293/1293, 1769/1769 |
| chatbot | 0.000054 | 0 | 1249/1249 |
| agenda | 0.00771 | 0.011342 | 2676/2676, 4574/4574 |
| agenda-detail | 0.001839 | 0.005445 | 2140/2140, 2669/2669 |

Tinggi dokumen **identik di semua halaman**. Sisa selisih yang belum 0:

- `<0,1%` (login, forgot, help, cart, library, chatbot): rasterisasi tepi kartu/bayangan, delta ≤2/255, tanpa
  pergeseran posisi satu pun (dibuktikan dengan pemetaan band diff: hanya baris tepi).
- **agenda 0,08–0,11%**, **agenda-detail 0,18–0,54%**: terkurung di tepi gambar kartu event (delta 122–194 pada
  ~2.000 px dari 1,9 juta px). DOM, teks, kelas, ukuran kotak, dan berkas gambar identik di kedua sisi; render
  blade deterministik (blade-vs-blade 0 px), jadi sisa ini berasal dari resampling gambar latar kartu. Dicatat
  sebagai residual, bukan diklaim nol.

## 5a. Keyboard, validasi, reload, dan restore (p6.md bagian 5)

Diuji oleh `docs/migration/tools/p6-a11y.mjs` → `p6-a11y.json`:

| Pemeriksaan | Hasil |
|---|---|
| **Enter** mengirim form login (tanpa mouse) | redirect ke `/akun/perpustakaan` (menunggu navigasi, bukan sekadar klik) |
| **Tab order** di kartu login | `tab-buyer → tab-publisher → email-field → forgot-link → password-field → toggle-pw-btn → remember-device → submit-btn` (sama dengan urutan visual) |
| **Focus ring** | `outline: 2px` pada `:focus-visible` (utilitas `.focus-ring`), tombol submit ikut |
| **Validasi** submit kosong (login) | banner tampil, pesan email + kata sandi tampil, fokus pindah ke `email-field` (field pertama yang invalid) |
| **Validasi** submit tidak lengkap (register) | banner tampil, error email/password/persyaratan tampil; tombol tetap aktif seperti prototype (prototype tidak memakai `disabled` di sini) |
| **Escape** menutup modal pengaturan | modal tertutup, `body.overflow` kembali normal (`hidden` → kosong) |
| **Escape** menutup modal pesanan + **Back** | modal tertutup; Back kembali ke `/akun/profil` (bukan `about:blank`) |
| **Reload** setelah simpan profil | nama baru bertahan di header dan di input (`Nama Setelah Reload`) |
| **Reload** di reader | posisi halaman 43 bertahan (`ikapi_reader_pos_laskar_aksara` = index 2) dan dipakai saat load |
| **Reload + hapus item keranjang** | total `Rp 103.000` konsisten setelah reload, hapus 1 item → 1 item, total `Rp 58.000` |
| **Scroll restore checkout** | prototype tidak menyimpan posisi scroll di keranjang (tidak ada kode restore); tidak ditambahkan (tidak menghidupkan fitur yang tidak ada) |

## 6. Perubahan yang wajib dijelaskan (bukan regresi)

| # | Perubahan | Alasan | Bukti |
|---|---|---|---|
| C1 | Token warna alpha → literal (`bg-[#fffffff2]`, `ring-[#673de633]`) | v4 mengompilasi `/opacity` via `color-mix(in oklab)` → beda 1–10/255 (P04 P4-2) | 184 penggunaan, 32 kombinasi di 17 halaman |
| C2 | Palet default v4 (`text-red-500` dll) dipin ke hex v3 | v4 memakai `oklch()` → `rgb(239,68,68)` jadi `oklch(0.637 …)` | 25 pasangan (nama, shade) yang dipakai prototype |
| C3 | `drop-shadow` memakai nilai literal | `drop-shadow-sm` v4 beda nilai dengan v3, dan rantai `var(--tw-drop-shadow)` tidak teraplikasi di browser ini (computed `none`) | forgot/verify 0,0032 → 0,0002 |
| C4 | `<style>` halaman dibungkus `@layer utilities` | di prototype CSS halaman **unlayered** seperti utilitas v3 → spesifisitas yang menentukan; tanpa layer, `html,body{padding:0}` mematikan `p-4` (kartu auth geser 16px), dengan `base` justru mematikan `.switch-checkbox:checked` (switch tetap abu) | 0,0032 → 0; switch settings benar |
| C5 | `space-y-*` pembanding di-`@layer utilities` + selector reset pakai `:where()` | v4 memindahkan margin ke sibling sebelumnya; tanpa reset, `mb-8` header reader kalah (tinggi −8px) | reader 1134 → 1142 (identik) |
| C6 | Ekstraksi fragmen dari DOM **tanpa JS** | dengan JS, `detail_agenda` menambahkan `hidden` karena `?id=` tidak ada, dan daftar hasil render ikut terekstrak | agenda-detail 1,0 vs 2,1 (tinggi) → identik |
| C7 | Path aset di dalam skrip/data jadi `/assets/ikapi/...` | skrip prototype membangun `'../../assets/…'` relatif ke file HTML | 5 gambar 404 → 0 |
| C8 | Guard modul per halaman (`#btn-state-nov18`, `#btn-state-rekomendasi`) | tiga halaman (agenda, perpustakaan, chatbot) memakai `#qa-simulation-panel` yang sama; guard lama membuat modul agenda jalan di halaman lain dan error | 0 error |
| C9 | Handler inline dipertahankan, fungsi di-`Object.assign(window, …)` | skrip prototype global, modul Vite ter-scope; handler inline tetap verbatim (P05 memilih mengganti; di sini 170 handler dipertahankan agar markup tetap sama) | 0 `on*` yang gagal (matriks) |
| C10 | Data demo dari fixture JSON | §4 prompt: fixture immutable, bukan salinan literal di dalam skrip | 7 fixture, 1 sumber per tabel |
| C11 | Rute `{book}`/`{event}` dengan validasi | prototype memakai `?id=`/tanpa parameter dan fallback ke record pertama; §4 melarang fallback itu | `/agenda/ev-9` → 404, buku tak dikenal → 404 |
| C13 | Navigasi skrip memakai path aplikasi (`/akun/perpustakaan`, `/status-pendaftaran-penerbit`) | skrip prototype menavigasi dengan nama file (`perpustakaan_saya_desktop.html`), sehingga login demo mendarat di URL 404 di aplikasi | ditemukan oleh audit a11y: redirect `/perpustakaan_saya_desktop.html` → `/akun/perpustakaan` |
| C12 | `welcome.blade.php` dihapus | sisa stock Laravel, 0 referensi, 0 markup Breeze; `/` sudah Beranda hasil migrasi | `route:list` 30 rute, semua view ada |

## 7. Cacat prototype yang dicatat (tidak diperbaiki diam-diam)

| # | Cacat | Bukti | Status |
|---|---|---|---|
| D-06-1 | Login/register: tombol tutup banner memanggil `hideBanner()` yang berada di dalam IIFE → `ReferenceError` di prototype | referensi + reproduksi | Diperbaiki dengan mengekspos handler (C9); perilaku tombol jadi berfungsi, dicatat |
| D-06-2 | Em dash `—` pada `<title>` (31 berkas) | P02 D8 | Dipertahankan (judul verbatim) |
| D-06-3 | `detail_agenda` tanpa `?id=` menampilkan error state, dan `?id=` tak dikenal jatuh ke `ev-1` | sumber baris 101–108 | Diganti rute ber-`{event}` + 404 (C11) |
| D-06-4 | Panel "Simulasi QA" (mode kosong/error) tampil di halaman produk agenda, perpustakaan, chatbot | markup sumber | Dipertahankan apa adanya (bagian dari prototype), lampirkan keputusan pemilik bila mau dihapus |
| D-06-5 | Badge keranjang "2" statis di seluruh header publik, tidak terhubung ke keranjang | 12 header | Dipertahankan; keranjang tetap dummy (tidak ada store nyata) |
| D-06-6 | `?sesi=` pada status penerbit hanya berpengaruh bila localStorage kosong | skrip `resolveView()` | Dipertahankan (sesuai prototype) |
| D-06-7 | Redirect setelah login/daftar memakai nama berkas prototype (`*_desktop.html`) → 404 bila dipindahkan apa adanya | ditemukan saat verifikasi Enter/redirect | Diperbaiki lewat peta rute JS (C13), dicatat di sini |

## 8. Inventaris: apa yang belum ada di fase ini

- **Komunitas (P07)**: link `Komunitas Literasi` di header/footer dirender `href="#"` karena rutenya belum ada
  (`$links()` mengembalikan `#` untuk rute tak terdaftar; tidak ada halaman palsu).
- **Portal penerbit & admin (P08–P10)**: tombol "Masuk ke Dashboard" pada status penerbit menuju rute
  `publisher.dashboard` (belum terdaftar → `#`).
- **Checkout nyata**: pilih metode + status hanya simulasi UI; tidak ada Midtrans, webhook, invoice PDF server,
  atau penyimpanan transaksi. "Sukes" hanya muncul lewat simulasi status (C1).
- **Auth nyata**: tidak ada hashing, OTP, email, middleware role, atau database (sesuai kontrak).
- **Reader**: hanya buku referensi (`laskar-aksara-pasundan`) yang punya halaman; slug lain → 404. Tidak ada unduh.
- **Duplikasi yang diketahui**: blok helper profil (`getStoredProfile`/`getInitials`/`syncGlobalIdentity`,
  ±40 baris) masih disalin apa adanya di 6 modul halaman akun, karena tiap skrip prototype memuatnya sendiri dan
  saya memilih port verbatim daripada menyatukan perilaku yang belum tentu identik. Kandidat ekstraksi ke
  `resources/js/ikapi/p6/account/profile-store.js` pada fase pembersihan berikutnya (bukan blocker P06).

## 9. Acceptance criteria — status

| Kriteria | Status | Bukti |
|---|---|---|
| Auth UI demo tanpa Laravel Auth/Breeze, tanpa email nyata | **Lulus** | `AuthDemoController` hanya `view()`; 0 `Auth::`, 0 mailer, 0 tabel user dipakai; `grep -ri breeze app routes resources config` = 0 |
| Akun, checkout, reader, agenda, chatbot render setara sumber | **Lulus** | §5: tinggi identik 100%, diff 0 pada 11 halaman, sisa ≤0,11% terjelaskan (§5) |
| State cart/order/library/reader konsisten di browser yang sama | **Lulus** | §4 C1/C2/D1/D2/D3 + key registry §2 (order seed → library → review memakai `bookId` yang sama) |
| Reader tanpa fungsi unduh | **Lulus** | matriks D2: `downloadButtons: 0`; tidak ada `[download]`, tidak ada PDF |
| Semua route/form/modal/validasi/aset/responsif berfungsi tanpa DB/API | **Lulus** | 21 URL diuji (18× 200 + 3× 404 terkontrol), 18 flow, 9 pemeriksaan a11y, 0 error, 0 respons ≥400 |

Verifikasi: `P6_BASE=… node docs/migration/tools/p6-parity.mjs` (per grup `P6_GROUP=a|b|c|d|e`),
`node docs/migration/tools/p6-interactions.mjs` (18 flow), dan `node docs/migration/tools/p6-a11y.mjs`
(9 pemeriksaan keyboard/validasi/reload). Kualitas kode: `phpstan` 0 error, `pint --test` lulus,
`npm run build` lulus, `php artisan route:list` 30 rute.