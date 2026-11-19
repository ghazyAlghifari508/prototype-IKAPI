# P10 — Integrasi demo antarhalaman (state, routing, alur)

Fase ini **tidak menambah halaman baru** dan tidak mengubah desain. Isinya: inventaris state, satu kontrak per
entitas, penelusuran alur lintas peran, audit route/alias, dan perbaikan regresi integrasi.
Prototype tidak diubah (`git status docs/design/prototype-copy` = 0, `docs/design/assets` = 0).

Bukti:
- `docs/migration/p10-inventory.json` — 24 key state yang dipakai aplikasi (dari 54 modul JS).
- `docs/migration/p10-flows.json` — 7 alur end-to-end dalam **satu** browser context, plus log baca/tulis localStorage.
- `docs/migration/p10-failures.json` — 5 mode kegagalan (store kosong, JSON rusak, storage diblokir, flag peran
  bertabrakan, double submit).
- `docs/migration/p9-admin.md`, `p8-publisher.md`, `p7-community.md`, `p6-buyer-flows.md`, `p5-buyer-core.md` — kontrak fase.

## 1. Inventaris state (entity → store → konsumen → mutator)

Satu kontrak per entitas. Tidak ada key yang dihapus atau direset oleh fase ini.

| Entitas / state | Sumber HTML (key asli) | Store target | Konsumen | Mutator | Aturan konsistensi |
|---|---|---|---|---|---|
| Sesi pembeli demo | `ikapi_buyer_session_demo` (login) | sama | header akun, komunitas (`canPostIn`), laporan, checkout/ulasan | login demo (P06), `community-core` (`ensureDemoSession`) | hanya penanda UI; bukan otorisasi. Profil/role tidak boleh berubah karena menulis key ini |
| Sesi admin demo | `ikapi_admin_session_demo` (login admin) | sama | halaman login → pratinjau dashboard | `p9/login.js` (tombol pratinjau) | tidak mengklaim keamanan; tidak memblokir halaman lain |
| Pengajuan penerbit | `ikapi_publisher_application_demo`, `ikapi_publisher_status_preview` | sama | register wizard, status penerbit, login penerbit, admin (baca role) | register wizard, chip demo status | satu pengajuan per browser; `pending/approved/rejected` konsisten dengan label status |
| Profil pembeli | `ikapi_user_profile` | sama | header, sidebar akun, 6 halaman akun, direktori komunitas | form profil (P06) | turunan `getInitials` dipakai header+sidebar |
| Preferensi akun | `ikapi_user_preferences` | sama | pengaturan akun | toggle + simpan (P06) | nilai disimpan setelah "Simpan", bukan saat toggle |
| Riwayat ulasan | `ikapi_user_review_history` | sama | halaman riwayat ulasan | editor ulasan (P06) | halaman detail buku menulis `ikapi_rating_*` saja (perilaku sumber, §7) |
| Rating buku | `ikapi_rating_<slug>` (referensi: `ikapi_rating_laskar_aksara`) | sama | detail buku, riwayat ulasan | form rating detail | key per buku; tidak menimpa rating buku lain |
| Laporan komentar & buku | `ikapi_comment_reports_demo`, `ikapi_book_reports_demo`, `ikapi_comment_reactions_demo` | sama | detail buku, admin moderasi ulasan (kategori) | menu komentar, dialog laporan | record membawa `targetType/targetId/status`; moderasi ulasan hanya menyentuh tipe produk |
| Keranjang & pesanan | markup + `cart` demo (badge), `orders-p6.json` | fixture + state halaman | keranjang, riwayat pesanan, perpustakaan | tombol tambah keranjang, checkout simulasi | angka pesanan tidak dikarang; status dari fixture |
| Perpustakaan & reader | `ikapi_reader_settings`, `ikapi_reader_bookmarks`, `ikapi_reader_pos_<slug>` | sama | perpustakaan, web reader | reader (halaman, tema, penanda) | posisi disimpan per buku; reload memulihkan halaman |
| Komunitas | `ikapi_communities_demo`, `ikapi_community_seed_version` | sama | direktori pembeli, profil/ruang/topik, admin kelola komunitas | P07 core (seed + CRUD), admin komunitas | satu daftar; seed idempoten lewat versi; admin dan pembeli membaca daftar yang sama |
| Topik & balasan | `ikapi_community_topics_demo`, `ikapi_community_replies_demo` | sama | ruang diskusi, topik, halaman balas, admin moderasi diskusi | P07 core, admin moderasi | `parentReplyId` wajib ada; parent lintas topik/cyclic → `null` (`normalizeReplyGraph`) |
| Keanggotaan | `ikapi_community_memberships_demo` | sama | semua layar komunitas | tombol gabung/keluar | bentuk `{userId: [communityId]}`; keluar menghapus id, bukan seluruh record |
| Laporan diskusi | `ikapi_discussion_reports_demo` | sama | admin moderasi diskusi | buyer (lapor balasan) + seed admin | `targetType` (`topic`/`reply`) + `targetId` + `status`; moderasi hanya menyentuh target yang dilaporkan |
| Preferensi bacaan | `ikapi_reading_prefs_demo` | sama | onboarding, beranda | wizard onboarding | `completed` setelah langkah akhir |
| Dashboard/portal | `publisher.json`, `admin.json` (fixture) | JSON di `resources/data/ikapi` | penerbit, admin | tidak ada (read-only) | angka yang sama dipakai lintas layar; KPI statis sumber ≠ dihitung ulang |

Key yang **tidak** dipakai produksi: `ikapi_probe` dan `ikapi_seed_*` hanya di `demo/state.js` (registry + probe
diagnostik), tidak pernah ditulis oleh halaman.

## 2. Kepemilikan & migrasi state

- Satu modul per domain: `ikapi/demo/state.js` (registry 21 key + guard), `p7/community-core.js` (komunitas),
  `p9/*` (admin, read + tulis untuk komunitas/moderasi), per-halaman P06/P08 untuk preferensi lokalnya.
- **Versi + migrasi idempoten:** komunitas memakai `ikapi_community_seed_version`; bila versi berbeda, hanya baris
  ber-`authorId USR-DEMO-*` yang dibuang lalu seed digabung kembali (`withSeeds(..., alwaysMerge=true)`). Data
  pengguna (author `USR-PMB-0042`) tidak pernah dihapus. Terverifikasi: kiriman pengguna tetap ada setelah reload.
- **JSON rusak:** semua pembacaan lewat `readJSON(key, fallback)` dengan `try/catch`; 11 key diisi string non-JSON →
  seluruh halaman tetap render (§5 mode 2), nilai jatuh ke default.
- **Storage diblokir (quota/private):** `writeJSON` mengembalikan `false`; aksi yang gagal tidak menampilkan sukses
  palsu (tombol komunitas tetap "Gabung Komunitas", §5 mode 3). Halaman tetap hidup.
- **ID baru:** `RPL-`/`TPC-`/`DRPT-` memakai `Date.now().toString(36).toUpperCase()` (unik per submit; tidak ada ID
  tetap yang dipakai ulang). ID yang sudah ada tidak pernah ditulis ulang.
- **Cross-tab:** tidak ada listener `storage`; satu origin, satu tab. Ini batasan, bukan klaim sinkronisasi.

## 3. Perbaikan integrasi yang dilakukan di fase ini

| # | Temuan | Dampak | Perbaikan |
|---|---|---|---|
| I1 | **Lima modul P07 boot sekaligus** di setiap halaman komunitas (semua memakai guard `#community-root`), sehingga `initCommunity` jalan 5× | 5 listener `submit` pada `#reply-view-form` dan `#reply-form` → **1 klik = 5 balasan** (terukur: 13 record dari 1 submit); seed ditulis 5× per muat | Tiap thin boot memeriksa `root.dataset.page` miliknya + flag `window.__ikapiCommunityBooted` di core. Terukur ulang: 1 listener, 1 balasan per klik, 1 baris per submit ganda |
| I2 | Regenerasi `p7-build.py` menghapus dua patch manual (`@section('chatbot','1')` dan payload `$ikapiP7`) | widget chatbot hilang (diff 0,26–0,4%) dan JS komunitas kehilangan `directoryUrl` | Keduanya dipindah ke dalam template builder supaya regenerasi tidak merusak |
| I3 | Guard id bertabrakan antar modul: `#kpi-container` (dashboard penerbit vs `/admin`), lalu `#bank-summary` (keuangan penerbit vs **pengaturan profil**) | modul halaman lain ikut boot lalu melempar `TypeError: ... addEventListener` (settings 0,35%, 1 error) | Guard unik per halaman (`#chart-panel`, `#book-form`, `#detail-invoice`, `#btn-review`, `#review-list`, `#b-bank`, `#activity-list`, …). Diverifikasi dengan matriks guard-vs-halaman: **0 overlap** |
| I4 | Tautan `.html` statis tersisa di 9 tempat (dashboard/keuangan/pesanan/invoice penerbit) | klik menuju 404 | `p8-build.py` sekarang memetakan nama berkas prototype ke `route('publisher.*')`; invoice ditambal langsung. Audit ulang: **0** `href="*.html"` di seluruh `resources/views` |

Tidak ada perubahan visual yang disengaja: seluruh parity P05–P09 yang relevan diukur ulang, hasilnya tetap 0
(P07 `directory/profile/room/topic/reply` = 0 setelah I2; P08/P09 tidak berubah).

## 4. Audit route, alias, dan parameter

| Kasus | Hasil terukur |
|---|---|
| `/penerbit/masuk` | 302 → `/masuk?role=publisher` (alias kontrak sumber) |
| `/penerbit/daftar` | 302 → `/daftar?role=publisher` |
| `/buku/tidak-ada` | 404 halaman 404 aplikasi (bukan fallback buku pertama) |
| `/komunitas/tidak-ada` | 404 |
| `/komunitas/{c}/diskusi/TPC-TIDAK-ADA` | 200 + state `#topic-unavailable` (bukan fallback topik pertama) |
| `/komunitas/{c}/diskusi/{t}/balas/RPL-TIDAK-ADA` | 200 + `#reply-parent-unavailable` ("komentar tidak tersedia") |
| `/masuk?role=superadmin` | 200, tab Pembeli aktif, tidak ada auto-login |
| Refresh / Back / Forward | halaman sama setelah refresh; Forward kembali ke `/katalog`; Back pada riwayat pertama = `about:blank` (perilaku browser) |
| Tautan `.html` di Blade | 0 tersisa (dicek dengan grep; P05–P09 memakai `route()`/`$links()`), kecuali teks komentar sumber |
| Redirect JS ke berkas `.html` | dipetakan ke path aplikasi (`JS_ROUTES` P08/P09, `LINKS` P05–P07) |

## 5. Matriks alur (`p10-flows.json`, 7 alur, 0 error JS / 0 respons ≥400)

| # | Alur | Hasil terukur |
|---|---|---|
| 1 | Guest → katalog → detail → keranjang → login/checkout → pesanan → perpustakaan → reader | 12 kartu katalog; detail `/buku/antologi-puisi-lembayung`; tambah keranjang → badge 2→3; keranjang 2 item, total `Rp 103.000`; overlay pembayaran 7 metode; status `berhasil` tampil; pesanan 5 dengan 4 status berbeda; perpustakaan 3 buku; reader "Halaman 41", setelah next + reload kembali ke halaman tersimpan (`ikapi_reader_pos_laskar_aksara = {pageIndex:1}`) |
| 2 | Registrasi penerbit → pending → admin approval → dashboard penerbit; kasus ditolak | wizard 3 langkah → `/status-pendaftaran-penerbit`, record `{name, status:"pending"}`; label "Menunggu persetujuan"; `?sesi=aktif` → "Disetujui" + CTA dashboard; chip "Ditolak" → "Tidak disetujui" + alasan tampil |
| 3 | Edit buku penerbit → katalog pembeli + katalog admin | 5 baris buku penerbit dengan judul yang sama di katalog pembeli; drawer detail & modal tambah berfungsi; katalog admin membaca fixture buku yang sama |
| 4 | Ulasan/laporan pembeli → moderasi admin | rating 4 + ulasan tersimpan di `ikapi_rating_laskar_aksara`; riwayat ulasan 2 kartu; laporan komentar tersimpan (`RPT-DEMO-001`, kategori "Spam & Promosi Eksternal"); antrean admin "3 laporan menunggu peninjauan", 3 kartu |
| 5 | Komunitas: gabung → topik → balas anak → moderasi admin → thread pembeli | keanggotaan `{USR-PMB-0042:["community-klub-buku"]}`; topik baru + balasan induk/anak dengan `parentReplyId` benar; laporan admin menargetkan balasan induk; setelah aksi: `report.status = removed`, target `removed`, **1 anak tetap hidup**; thread pembeli: 1 placeholder "Komentar telah dihapus", anak tetap terlihat |
| 6 | Pencairan penerbit → status admin | saldo penerbit `Rp 840.000 → Rp 590.000` setelah pengajuan `Rp 250.000`; modal sukses muncul (1.000 ms); antrean admin menampilkan pengajuan `Rp 645.000` (fixture admin, tidak terhubung ke state penerbit — §7) |
| 7 | Refresh / Back / Forward / deep link / peran / id invalid | lihat §4; role switch tanpa auto-login (`sessionAfterRoleSwitch` tetap sesi lama, bukan sesi baru) |

## 6. Mode kegagalan (`p10-failures.json`, 5 mode, 0 error)

| Mode | Hasil |
|---|---|
| Store kosong | Semua layar menyemai dirinya sendiri: 3 komunitas, 8 balasan seed, 12 katalog, 5 pesanan, 5 buku penerbit, 2 baris admin. Tidak ada halaman kosong |
| JSON rusak (11 key) | Direktori 3 kartu, topik 4 node, profil terisi, reader halaman 41 — semua render tanpa error |
| Storage diblokir | Halaman hidup; tombol komunitas tetap "Gabung Komunitas" (tidak mengklaim berhasil); keuangan penerbit tetap menampilkan saldo |
| Flag peran bertabrakan (buyer + admin preview + pending publisher) | `/admin`, `/penerbit/keuangan`, `/akun/profil`, `/status-pendaftaran-penerbit` semuanya render; tidak ada redirect loop. (Simulasi UI, bukan kontrol akses) |
| Double submit | 2 klik cepat → **1** balasan tersimpan |

## 7. Batasan & isu untuk P11 (bukan regresi, bukan "diperbaiki diam-diam")

| # | Hal | Bukti | Keputusan |
|---|---|---|---|
| L1 | Badge keranjang (demo counter) tidak sama dengan jumlah baris keranjang: setelah 1 tambah badge 3, keranjang 2 item | flow 1 + perilaku sumber (badge statis "2") | Dipertahankan; bukan sinkronisasi yang pernah ada di sumber |
| L2 | Ulasan di detail buku (`ikapi_rating_*`) tidak muncul di Riwayat Ulasan (`ikapi_user_review_history`) | sumber: dua halaman tidak berbagi key | Tidak disinkronkan (§3 prompt: jangan cross-sync yang tidak pernah ada) |
| L3 | Pengajuan pencairan penerbit tidak mengubah antrean pencairan admin | sumber: fixture admin statis | Tidak disinkronkan; dicatat sebagai batasan demo |
| L4 | Riwayat pesanan/perpustakaan tidak bertambah dari checkout simulasi | sumber tidak menambah record | Dipertahankan |
| L5 | Approve pengajuan di admin tidak menulis status pengajuan penerbit | admin sembunyikan aksi nyata; status memakai `?sesi=` | Dipertahankan; P11 dapat memutuskan sinkronisasi minimal |
| L6 | Tidak ada listener `storage` (multi-tab) | desain P03/P10 | Satu tab; dokumentasi menyebut batasan |
| L7 | `admin-guard.js` tidak dipasang (alasan P08/P09) | P02 D5 | Dicatat; bukan keamanan |
| L8 | Presisi piksel seluruh halaman tetap seperti fase masing-masing (P05 detail & katalog punya sisa AA yang sudah didokumentasikan) | laporan fase | P11 menangani regresi global |

## 8. Permyataan batas

Semua peran (pembeli, penerbit, admin), pembayaran, moderasi, dan pencairan di aplikasi ini adalah **simulasi
frontend**. Tidak ada autentikasi nyata, middleware peran, database, gateway pembayaran, email, atau API bisnis.
State hanya hidup di `localStorage` satu browser/origin dan dapat diubah pengguna.

## 9. Untuk P11

- Jalankan ulang baseline P02 untuk 45 halaman; gunakan `p10-flows.mjs` + `p10-failures.mjs` sebagai regression
  cepat lintas peran.
- Regenerasi view lewat builder (`p5/p6/p7/p8/p9-build*`) sekarang aman untuk patch kritis (chatbot section, payload
  `$ikapiP7`), tetapi patch manual lain harus dicek ulang sebelum regenerasi.
- Bila pemilik ingin L2/L3/L5 disinkronkan, itu penambahan fitur baru dan perlu persetujuan (bukan bagian migrasi).