# P07 — Komunitas Literasi: direktori, profil, ruang diskusi, topik, balas komentar

Sumber: `docs/design/prototype-copy/user/komunitas_literasi_desktop.html` (3.084 baris, SPA 7 view dalam satu berkas).
Prototype **tidak diubah** (`git status docs/design/prototype-copy` = 0, `docs/design/assets` = 0).
Bukti: `p7-parity.json` + `baselines/p7/**` (screenshot & diff), `p7-flows.json` (6 skenario), `p7-source/**`
(fragmen per view), `resources/data/ikapi/community-seed.json` (data demo hasil ekstraksi).

## 1. Peta lima halaman → lima Blade + lima route

| # | View di sumber | Blade | Route (name) | Parameter |
|---|---|---|---|---|
| 1 | `#view-explore` + `#view-noresults` + `#view-empty` + hero | `buyer/community/index.blade.php` | `GET /komunitas` (`community`) | - |
| 2 | `#view-profile` | `buyer/community/show.blade.php` | `GET /komunitas/{community}` (`community.show`) | id komunitas |
| 3 | `#view-room` | `buyer/community/discussion.blade.php` | `GET /komunitas/{community}/diskusi` (`community.discussion`) | id komunitas |
| 4 | `#view-topic` | `buyer/community/topic.blade.php` | `GET /komunitas/{community}/diskusi/{topic}` (`community.topic`) | + id topik |
| 5 | `#view-reply` | `buyer/community/reply.blade.php` | `GET /komunitas/{community}/diskusi/{topic}/balas/{reply?}` (`community.reply`) | + id balasan (opsional) |

Bersama: `partials/public/header` (guest, badge keranjang "2", pill akun, `z-40`, placeholder pencarian komunitas),
`partials/public/footer`, dan overlay `composer-modal`, `discussion-report-modal`, `delete-modal`, `content-menu`,
`leave-modal`, `sr-announcer` yang dipakai kelima halaman lewat `@push('overlays')`.

`main` memakai `pt-32` + `min-h-[calc(100vh-16rem)]` seperti sumber; konten dibungkus container
`max-w-[1360px] px-4 sm:px-6 lg:px-8 pb-10 pt-4` milik sumber (bukan container baru).

## 2. Arsitektur implementasi & graf data

```
Blade (5 halaman)  ──data-page/data-community/data-topic/data-reply──►  p7/{directory,profile,discussion,topic,reply}.js
                                                                          │  (thin boot: baca atribut, panggil core)
                                                                          ▼
                                                        p7/community-core.js  ← port VERBATIM dua <script> sumber
                                                        (discovery+membership 667 baris, diskusi 1.679 baris)
                                                                          │
                     ┌────────────────────────────────────────────────────┤
                     ▼                                                    ▼
        localStorage (kontrak P03/P06)                        renderer sumber apa adanya
        ikapi_community_memberships_demo                      buildCard, buildThreadRow, buildTopicRow,
        ikapi_community_topics_demo                           buildReplyNode, buildReplyBody, buildDeletedPlaceholder…
        ikapi_community_replies_demo
        ikapi_discussion_reports_demo
        ikapi_community_seed_version
```

Perubahan perilaku **hanya** pada navigasi: di sumber, `openProfile/openRoom/openTopic/openReplyView` mengganti view
di tempat; di sini fungsi-fungsi itu menavigasi ke URL halaman masing-masing (dan tetap melukis saat halaman sedang
boot untuk render awalnya). `showView('explore'|'noresults'|'empty')` tetap switch lokal karena ketiganya memang satu
halaman. Link jumlah balasan kini ber-`href` path topik sebenarnya (sumber memakai `?topik=`), sehingga klik,
salin-tautan, dan buka-tab-baru menuju halaman yang sama.

Data: `resources/data/ikapi/community-seed.json` = 3 komunitas, 6 topik, 8 balasan (termasuk 1 balasan bersarang),
hasil ekstraksi dari fungsi `seedTopics()`/`seedReplies()` milik prototype (bukan ditulis ulang). Halaman menerima
data ini lewat controller (`Fixtures::get('community-seed')`) untuk validasi id; render daftar tetap dari store
`localStorage` seperti sumber, sehingga topik/balasan buatan pengguna langsung tampil tanpa server.

## 3. Key preservation (audit nama asli, tanpa reset)

| Key | Status | Catatan |
|---|---|---|
| `ikapi_community_memberships_demo` | dipakai apa adanya | bentuk `{ "<userId>": ["<communityId>", …] }` |
| `ikapi_community_topics_demo` | dipakai apa adanya | record: `id, communityId, title, body, authorId, authorName, createdAt, updatedAt, removed` |
| `ikapi_community_replies_demo` | dipakai apa adanya + dinormalisasi | `parentReplyId` selalu ada; parent lintas-topik/tiada/cyclic → `null` (`normalizeReplyGraph`, fungsi sumber) |
| `ikapi_discussion_reports_demo` | dipakai apa adanya | `{id, targetType, targetId, topicId, communityId, reasonId, reasonLabel, details, reporterUserId, status, createdAt}` |
| `ikapi_community_seed_version` | dipakai apa adanya | `migrateDemoSeeds()` sumber: hanya membuang baris ber-`authorId USR-DEMO-*` saat versi seed berubah; data pengguna tidak dihapus |
| `ikapi_buyer_session_demo` | dibaca | sesi demo menentukan izin tulis; P06 menulis key yang sama |

Tidak ada key yang di-rename, tidak ada `localStorage.clear()`, tidak ada migrasi destruktif.

## 4. Hasil skenario (p7.md bagian 6) — `p7-flows.json`

| # | Skenario | Bukti terukur |
|---|---|---|
| 1 | Direktori → cari/filter → profil → gabung → ruang → topik → balas root → balas anak → hierarki → refresh | 3 kartu; cari "filologi" → 1 kartu; cari "zzz" → state *no results*; profil `/komunitas/community-filologi`; gabung → `{USR-PMB-0042:["community-filologi"]}`; ruang + "Buat Topik" aktif; buat topik → `TPC-MWMLRO0V` (tersimpan); balas root → `RPL-…` dengan `parentReplyId: null`; halaman balas anak `/…/balas/RPL-MWMLROXV` dengan kartu parent tampil; simpan → anak `parentReplyId = RPL-MWMLROXV`, `topicId` sama; setelah reload tree punya 3 indentasi berbeda |
| 2 | Nonmember: tombol Buat Topik disabled; guest boleh baca; member bisa menulis; setelah keluar disabled lagi | nonmember: `disabled = true`, kelas `cursor-not-allowed bg-surface-neutral text-ink-muted` (abu-abu), tanpa redirect/auto-join; guest: judul topik terbaca, form balas **tidak** tampil; setelah gabung: `disabled = false`; setelah keluar + konfirmasi: `disabled = true` |
| 3 | Link `0/1/N balasan` membuka topik dari atas, tanpa fokus composer | label sumber dipertahankan: `chat_bubble 0 balasan`, `chat_bubble 1 balasan`, `chat_bubble 4 balasan`; `aria-label` "Lihat diskusi …, belum ada balasan" untuk 0; judul preview bukan elemen klik (`titleClickable = false`); setelah klik: URL topik, `scrollY = 0`, `document.activeElement = #topic-title` (bukan textarea) |
| 4 | Balas ke parent berbeda, banyak saudara, >3 level, mobile 320/390 | data uji 5 level + 2 saudara: indentasi `72 / 108 / 144 / 180 / 180` px, 4 indentasi unik, saudara sejajar di 144, maksimum 3 anak per node; **cap kedalaman 4 level sama dengan prototype** (diukur di dua halaman: `[72,108,144,180,180,180]` keduanya); 320 & 390: `scrollWidth == clientWidth` (tanpa overflow horizontal) |
| 5 | Edit/hapus/lapor balasan bersarang; parent dihapus dengan anak hidup; id invalid | lapor balasan anak: menu → modal → tersimpan `{targetType:'reply', targetId:'RPL-2026-207', status:'pending'}`; hapus parent milik sendiri yang punya 2 anak: parent `removed: true`, **kedua anak `removed: false` dan tetap dirender**, placeholder "Komentar telah dihapus" muncul; id invalid: topik `TPC-TIDAK-ADA` → 200 + state `#topic-unavailable` (bukan fallback baris contoh), topik milik komunitas lain → **404**, komunitas tak dikenal → **404** |
| 6 | Laporan bisa dibaca admin (P09) | bentuk record: `communityId, createdAt, details, id, reasonId, reasonLabel, reporterUserId, status, targetId, targetType, topicId` — field yang dibutuhkan antrean moderasi admin ada (`adminFieldsPresent = true`) |

**6/6 skenario lulus, 0 error JS, 0 respons ≥400.**

## 5. Paritas visual (screenshot diff, ambang 0)

Viewport 1440×900 dan 390×844, konteks browser baru per halaman, caret dinonaktifkan.

| Halaman | 1440×900 | 390×844 | Tinggi (blade/proto) | Teks |
|---|---|---|---|---|
| Direktori | **0** | **0** | 1509/1509, 2826/2826 | sama |
| Profil | **0** | **0** | 1454/1454, 2426/2426 | sama |
| Ruang Diskusi | **0** | **0** | 1034/1034, 1494/1494 | sama |
| Detail Topik | **0** | **0** | 1321/1321, 1913/1913 | sama |
| Balas Komentar | **0** | **0** | 1008/1008, 1189/1189 | sama |

`broken images`: 1 di sisi prototype pada direktori dan halaman balas (`<img src="">` placeholder avatar, cacat
baseline D4), 0 di Blade karena aset nyata disajikan.

## 6. Perubahan teknis yang dijelaskan (bukan regresi)

| # | Perubahan | Alasan | Bukti |
|---|---|---|---|
| C1 | Satu inti JS (`community-core.js`) berisi kedua `<script>` sumber apa adanya + shim router | sumber adalah SPA; halaman harus punya URL sendiri tanpa menyalin 2.300 baris per halaman | diff 0 di 5 halaman |
| C2 | `openProfile/openRoom/openTopic/openReplyView` menavigasi saat bukan boot | view tujuan tidak ada di halaman ini; memaksa render di halaman salah melempar error (`Cannot set properties of null`) | navigasi kartu → `/komunitas/…` |
| C3 | `showView('explore'/'noresults'/'empty')` tetap lokal | ketiganya satu halaman | state pencarian kosong |
| C4 | Boot kedua blok dijalankan dengan `getElementById` toleran (stub sementara, dipulihkan segera) | boot SPA mengikat ~25 kontrol yang tidak ada di semua halaman | 0 error, semua binding halaman berfungsi |
| C5 | Handler inline (`oninput`, `onclick`) diekspos ke `window` | modul Vite ter-scope; tanpa ini pencarian direktori melempar `handleSearchInput is not defined` | pencarian 3 → 1 kartu |
| C6 | Link `N balasan` di-`href` ke path topik | sumber memakai `?topik=` + `preventDefault`; dengan halaman nyata href itu menunjuk balik ke ruang | `href` = `/komunitas/community-klub-buku/diskusi/TPC-2026-101` |
| C7 | Halaman balas memuat markup view topik dalam keadaan tersembunyi | `openTopic()`/`renderReplies()` adalah fungsi sumber yang melukis view topik sebelum composer balasan; view itu tidak terlihat (`paintView('reply')`) dan tidak ada markup yang diduplikasi tangan | halaman balas render tanpa error |
| C8 | Controller: id topik/balasan hasil demo (localStorage) diterima lewat format id, id seed lintas-komunitas tetap 404 | topik buatan pengguna harus bisa dibuka/di-refresh/di-bookmark; "id invalid" tidak boleh memakai baris contoh | `TPC-TIDAK-ADA` → unavailable, `TPC-2026-101` di komunitas lain → 404 |
| C9 | `divide-y`/`divide-x` dikembalikan ke arah v3 di `app.css` | v4 memindahkan garis ke `border-bottom` anak terakhir-1; v3 memakai `border-top` saudara berikutnya → balasan pertama tumbuh 1px dan garis di sisi salah | topik: dh −1px → **0**, ratio 1,1% → **0** |
| C10 | Chatbot mengambang dipindahkan ke section layout (`@section('chatbot','1')`) | prototype memuat `chatbot-widget.js` di beranda, katalog, agenda, detail agenda, komunitas, chatbot; P05 memuatnya manual di 2 halaman, P06 agenda melewatkannya | direktori/profil/ruang/topik/balas 0%; agenda-detail P06 0,18% → **0** |
| C11 | Aset di dalam inti JS memakai `/assets/ikapi/...` | skrip sumber menulis `../../assets/...` relatif ke berkas HTML | 4 gambar 404 → 0 |

## 7. Cacat baseline yang dicatat (tidak diperbaiki diam-diam)

| # | Cacat | Bukti | Status |
|---|---|---|---|
| D-07-1 | Prototype tidak menampilkan footer pada halaman komunitas? **Tidak** — footer ada; yang hilang hanya di sebagian state. Diukur: footer identik 364px di kedua sisi | `_p7b2` probe | bukan cacat |
| D-07-2 | Kedalaman balasan dibatasi 4 level indentasi (level 5+ sejajar dengan level 4) | prototipe & Blade sama: `[72,108,144,180,180,180]` | dipertahankan (perilaku sumber); perlu keputusan desain bila ingin tak terbatas |
| D-07-3 | Panel "Mode Simulasi" QA (normal/18 Nov/ kosong) ada di halaman produk | markup sumber | dipertahankan; kandidat penghapusan terpisah |
| D-07-4 | `<img src="">` placeholder avatar pada direktori/balas | 1 gambar rusak di sisi prototype | dipertahankan (D4 P02) |
| D-07-5 | Sesi demo dibuat otomatis (`ensureDemoSession`) saat halaman komunitas dibuka | fungsi `ensureDemoSession` | dipertahankan sesuai prototype; dicatat sebagai batasan: izin peran sepenuhnya simulasi klien |

## 8. Batasan frontend-only (izin/role)

Tidak ada auth nyata, middleware peran, atau API. "Anggota" berarti id pengguna demo ada di
`ikapi_community_memberships_demo`; "penulis" berarti `authorId` sama dengan id sesi demo. Semua pemeriksaan
(membuat topik, membalas, edit/hapus, lapor) berjalan di browser dan dapat diubah lewat devtools. Laporan tersimpan
di `ikapi_discussion_reports_demo` dan **belum** dikirim ke admin mana pun — P09 akan membaca key yang sama.

## 9. Untuk fase berikutnya

- **P09 (admin)**: baca `ikapi_discussion_reports_demo` dan `ikapi_community_topics_demo` dengan bentuk record di §3;
  tidak perlu fixture duplikat. `kelola_komunitas_desktop.html` dan `moderasi_diskusi_komunitas_desktop.html` belum
  disentuh (milik P09).
- **P11 (QA global)**: `divide-y`/`divide-x` dan section chatbot sekarang global; jalankan ulang seluruh baseline P02
  untuk memastikan tidak ada halaman lain yang bergantung pada arah v4.
- Ajukan Kerja Sama Komunitas tetap **tidak** dihidupkan (tidak ada markup/kode di fase ini).
- Agenda Literasi tetap terpisah dari Komunitas.

## 10. Status kriteria

| Kriteria | Status | Bukti |
|---|---|---|
| Lima halaman independen, URL/refresh/bookmark/Back, id invalid → unavailable | **Lulus** | §1, §4 nomor 5; `TPC-TIDAK-ADA` 200 + `#topic-unavailable`; komunitas/topik lintas-komunitas 404 |
| Hero hanya di direktori, kartu horizontal photo-first, profil & ruang sesuai sumber | **Lulus** | §5 diff 0 pada kelima halaman |
| Interaksi terkunci (disabled nonmember, composer topik, parent/child reply, link jumlah balasan tanpa autofocus) | **Lulus** | §4 nomor 2, 3 |
| Relasi tree tersimpan (bukan indentasi semu), sibling/anak terpisah, deep nesting terbaca di mobile | **Lulus** | §4 nomor 4 + gambar `baselines/p7/states/topic-deep-390.png`, `topic-deep-320.png` |
| Edit/hapus/lapor, placeholder parent terhapus, anak tidak ikut terhapus | **Lulus** | §4 nomor 5 |
| Key lama tidak berubah/direset; laporan siap dibaca P09 | **Lulus** | §3, §4 nomor 6 |
| Tanpa DB/API/auth nyata, tanpa menghidupkan fitur yang dibatalkan | **Lulus** | §8 |

Verifikasi: `node docs/migration/tools/p7-parity.mjs` (5 halaman × 2 viewport), `p7-flows.mjs` (6 skenario),
`p7-extract.mjs`/`p7-build.py` (regenerasi dari sumber). `phpstan` 0 error, `pint --test` lulus, `npm run build` lulus.