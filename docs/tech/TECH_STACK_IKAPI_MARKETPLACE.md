# Tech Stack &amp; Technical Architecture — Marketplace Buku Digital IKAPI Jawa Barat

> **Status:** Rekomendasi arsitektur dan baseline teknologi untuk implementasi.
> **Tujuan dokumen:** Menjadi referensi tunggal bagi developer dan AI coding agent tentang teknologi yang digunakan, alasan pemilihannya, batasan arsitektur, serta aturan implementasi.
> **Cakupan:** Aplikasi web marketplace e-book multi-penerbit untuk IKAPI Jawa Barat.
> **Tanggal penyusunan:** 4 November 2026.
> **Prinsip:** Utamakan implementasi yang aman, teruji, mudah dipelihara, dan mudah diserahterimakan kepada pengelola IKAPI; jangan menambahkan kompleksitas tanpa alasan yang dapat diverifikasi.

## 1. Sumber Kebutuhan dan Prioritas

Dokumen ini mengikuti kebutuhan proyek yang disampaikan melalui:

1. `Proposal_Abdimas_Online_Bookstore_IKAPI_Jabar_REVISI_FORMAT_ASLI (2).pdf` — referensi utama tujuan, kebutuhan inti, dan konteks pengabdian masyarakat.
2. `USE CASE.drawio` — referensi fitur dan aktor yang diusulkan, termasuk sejumlah fitur tambahan di luar fokus utama proposal.
3. `ERD.drawio` — rancangan awal basis data, **bukan** skema final yang boleh diimplementasikan secara mentah.

**Batasan produk:** Ini adalah **marketplace buku digital (e-book)**, bukan marketplace buku fisik. Tidak boleh berasumsi diperlukan pengiriman fisik, stok gudang, atau ongkos kirim tanpa persetujuan perubahan ruang lingkup.

### Aktor utama

- **Pembeli/Pelanggan:** registrasi, login, jelajah katalog, cari/filter buku, keranjang, checkout, pembayaran, riwayat pesanan, perpustakaan pribadi, dan reader e-book.
- **Penerbit/Publisher:** registrasi dan verifikasi, kelola katalog/PDF dan harga, lihat penjualan, pendapatan, dan pengajuan pencairan dana.
- **Administrator IKAPI:** verifikasi penerbit, pengawasan katalog, transaksi, pemberian persetujuan yang diperlukan, serta pemrosesan pengajuan pencairan.

### Fitur inti (prioritas awal)

1. Identitas pengguna, autentikasi, otorisasi, dan pemisahan data antar-penerbit.
2. Katalog e-book dari banyak penerbit, kategori, penulis, sinopsis, harga, pencarian/filter, dan preview sesuai aturan.
3. Upload dan pemrosesan file PDF asli secara privat; alur moderasi/persetujuan katalog.
4. Keranjang, order dengan banyak buku/berbagai penerbit, checkout, pembayaran Midtrans, dan invoice.
5. Pemberian hak akses baca hanya setelah pembayaran diverifikasi oleh backend.
6. Perpustakaan pribadi dan pembaca e-book berbasis web tanpa fitur penyerahan/unduh PDF asli.
7. Dasbor penerbit, pencatatan pendapatan yang bisa diaudit, pengajuan pencairan, persetujuan administrator, dan bukti transfer.
8. Audit, monitoring, testing, dokumentasi operasional, backup/restore, dan serah terima.

**Fitur yang ada di use case, tetapi prioritas implementasinya harus dikonfirmasi:** forum/komunitas, agenda event, berita literasi, bookmark, rating/ulasan, balasan penerbit, dan fitur lanjutan lainnya. Jangan menganggap seluruh fitur itu wajib masuk MVP jika belum ada keputusan ruang lingkup.

---

## 2. Stack Resmi yang Dipilih

Tabel ini merupakan **arah implementasi utama**, bukan undangan untuk mengganti framework secara spontan. Sebelum instalasi, cek versi stabil, matriks kompatibilitas, dan dokumentasi resmi dependency yang akan dipakai.


| Area                        | Teknologi yang dipilih                                                | Tanggung jawab / alasan                                                                                 |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Bahasa backend              | **PHP 8.4 atau 8.5**, pilih satu versi yang kompatibel                | Runtime aplikasi Laravel; pastikan extension PHP dan package kompatibel.                                |
| Backend                     | **Laravel 13**                                                        | Routing, domain/service, validation, authorization, queue, transaksi DB, integrasi payment, testing.    |
| Frontend                    | **React 19 + TypeScript**                                             | Katalog interaktif, keranjang, checkout UI, perpustakaan, reader, dan dashboard penerbit.               |
| Integrasi full-stack        | **Inertia.js 3**                                                      | Menghubungkan halaman React dengan Laravel tanpa membuat REST API terpisah untuk setiap halaman web.    |
| Styling                     | **Tailwind CSS 4**                                                    | Design system, responsive styling, konsistensi antarmuka.                                               |
| UI components               | **shadcn/ui**                                                         | Basis komponen siap pakai yang dikustomisasi; hindari membangun komponen generik dari nol tanpa alasan. |
| Database relasional         | **PostgreSQL 18**                                                     | Foreign key, constraint, transaksi, laporan penjualan, ledger, dan pencarian katalog.                   |
| ORM &amp; migrasi           | **Laravel Eloquent + Laravel Migrations**                             | Relasi, query, skema dan perubahan DB yang dapat dilacak.                                               |
| Authentication              | **Laravel Fortify melalui starter kit Laravel resmi**                 | Login, registrasi, reset password, verifikasi email, session authentication.                            |
| Authorization               | **Laravel Policies/Gates + Spatie Laravel Permission**                | Role/permission dan pemeriksaan kepemilikan objek bisnis di backend.                                    |
| Admin panel                 | **Filament 5**, khusus area administrator/internal                    | CRUD, form, tabel, moderasi, dan pekerjaan operasional admin; tetap berbagi backend Laravel.            |
| Payment gateway             | **Midtrans Snap**                                                     | Metode pembayaran Indonesia, pembuatan transaksi, dan integrasi webhook.                                |
| Pencairan penerbit          | **Internal payout workflow**, integrasi **Midtrans Payouts opsional** | Pengajuan, verifikasi, transfer, audit; otomasi hanya setelah kesiapan merchant/layanan dipastikan.     |
| Penyimpanan PDF/aset        | **Cloudflare R2 atau storage S3-compatible privat**                   | File PDF asli tetap private, file tidak dipaparkan lewat public bucket.                                 |
| PDF processing &amp; reader | **Backend PDF page rendering + React reader**                         | Menampilkan turunan halaman tanpa mengirimkan PDF asli ke browser pembeli.                              |
| Background jobs             | **Laravel Queue**                                                     | Konversi PDF, email, proses berat non-interaktif.                                                       |
| Queue/cache backend awal    | **Database queue/cache Laravel bila cukup**                           | Mengurangi kebutuhan infrastruktur tambahan saat MVP.                                                   |
| Queue/cache saat dibutuhkan | **Redis**                                                             | Dipakai jika kebutuhan kapasitas/latensi/observabilitas membenarkan tambahan layanan.                   |
| Search awal                 | **PostgreSQL Full-Text Search + `pg_trgm`**                           | Pencarian judul, penulis, dan toleransi salah ketik tanpa search engine tersendiri.                     |
| Backend test                | **Pest + PHPUnit (ekosistem Laravel)**                                | Unit/feature/integration tests dengan fokus pembayaran, akses, ledger, dan security.                    |
| Deployment                  | **Linux VPS + Nginx + PHP-FPM**                                       | Menjalankan Laravel dan aset React pada deployment yang relatif sederhana.                              |
| Container packaging         | **Dockerfile**, jika dibutuhkan deployment                            | Repo siap dibangun sebagai image; tidak mengharuskan setiap developer memasang Docker lokal.            |
| CI/CD                       | **GitHub Actions**                                                    | Lint, type-check, test, build, dan deployment yang terkontrol.                                          |


**Klarifikasi versi:** Angka versi di atas adalah target yang telah direkomendasikan; kunci versi aktual di lockfile setelah pemeriksaan kompatibilitas resmi. Jika terjadi benturan package, laporkan pilihan dan dampaknya—jangan diam-diam mengganti stack.

---

## 3. Keputusan Arsitektur Utama

### 3.1 Modular monolith, bukan microservices

Gunakan **satu aplikasi Laravel** yang memuat domain bisnis terpisah secara jelas dan frontend React melalui Inertia.

```text
             Browser Pembeli / Penerbit / Admin
                            |
                            v
                 Nginx + Laravel (PHP)
                    |               |
                    |           Inertia + React
                    |
       +------------+-------------+-------------+
       |            |             |             |
   Catalog       Orders        Library       Payouts
       |            |             |             |
       +------------+-------------+-------------+
                            |
                      PostgreSQL
                       /      \
              Private Storage   Queue/Workers
                      |               |
                  E-book PDF      PDF Processing
                            |
                    Midtrans Integration
```

**Penjelasan:** Diagram menggambarkan hubungan logis, bukan semua aliran jaringan secara literal. Callback Midtrans diterima backend dan diproses dengan autentikasi/validasi yang tepat.

**Aturan:**

- Jangan membuat frontend Next.js dan REST API Laravel terpisah hanya demi tren teknologi.
- Jangan menambah NestJS, Express, layanan Python, microservices, message broker, Kubernetes, atau API gateway tanpa kebutuhan nyata yang disetujui.
- Tidak perlu REST API publik untuk halaman web biasa. Tambahkan API terpisah hanya jika ada kebutuhan klien eksternal/mobile yang nyata.
- Pisahkan domain berdasarkan tanggung jawab bisnis, bukan semata memecah file untuk terlihat modular.
- Controller harus tipis; proses bisnis penting ditempatkan dalam service/action/domain layer dan diuji.

### 3.2 React + Inertia

- Laravel mengelola route utama, autentikasi, otorisasi, validasi, data halaman, dan logika transaksi.
- React mengelola interaksi antarmuka; TypeScript dipakai secara konsisten.
- Terapkan SSR pada halaman publik/katalog/detail buku **apabila diperlukan SEO** dan setelah memvalidasi integrasi SSR, bukan dengan asumsi bahwa SEO otomatis optimal.
- Gunakan komponen UI yang reusable dan tidak berlebihan; jangan menjadikan satu halaman sebagai satu file raksasa.
- Admin Filament menggunakan pendekatan UI berbeda dari React (berbasis ekosistem Laravel/Livewire). Isolasi khusus area admin agar keduanya tidak saling mencampur komponen secara sembarangan.

### 3.3 PostgreSQL dan model relasional

PostgreSQL menjadi sumber kebenaran untuk transaksi, relasi pengguna–penerbit–buku, hak akses, dan pencairan. Terapkan foreign key, unique constraint, index, check constraint yang relevan, transaction boundary yang eksplisit, serta migrasi yang reversible bila masuk akal.

**Jangan menganggap MongoDB/NoSQL diperlukan** untuk MVP transaksi relasional ini. Untuk katalog awal, gunakan PostgreSQL search; search engine khusus seperti Elasticsearch/Meilisearch baru boleh dipertimbangkan jika kebutuhan pencarian dan pengukuran performa membuktikannya.

---

## 4. Struktur Proyek yang Direkomendasikan

Ini **struktur target contoh**, bukan struktur bawaan yang wajib diciptakan seluruhnya sejak hari pertama.

```text
ikapi-bookstore/
├── app/
│   ├── Domain/
│   │   ├── Identity/
│   │   ├── Publishers/
│   │   ├── Catalog/
│   │   ├── Cart/
│   │   ├── Orders/
│   │   ├── Payments/
│   │   ├── Library/
│   │   ├── Reader/
│   │   └── Payouts/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Middleware/
│   ├── Policies/
│   ├── Jobs/
│   └── Filament/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── resources/
│   └── js/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── hooks/
│       └── types/
├── routes/
├── tests/
│   ├── Feature/
│   └── Unit/
├── docs/
├── Dockerfile
└── composer.json
```

Contoh tugas/domain yang perlu dipisahkan secara jelas: `CreateOrder`, `HandleMidtransNotification`, `GrantBookEntitlement`, `RecordPublisherEarning`, `RequestPayout`, dan `ApprovePayout`. Nama kelas sebenarnya mengikuti konvensi codebase dan implementasi yang disepakati.

---

## 5. Aturan Keamanan dan Bisnis yang Wajib Dipatuhi

### 5.1 Hak akses/isolasi tenant penerbit

- Jangan hanya memeriksa `role === publisher`. **Setiap** akses baca/tulis buku, laporan, rekening, pengajuan payout, dan data order harus diperiksa terhadap publisher yang memang berhak.
- Authorization harus berjalan di server melalui Policies/Gates; pembatasan tombol di UI bukan mekanisme keamanan.
- Administrator mempunyai kewenangan yang jelas, auditable, dan tidak otomatis berhak melewati semua pemeriksaan tanpa aturan.
- Pertimbangkan tabel `publisher_memberships` bila satu penerbit memiliki beberapa staf/operator; jangan memaksakan satu akun = satu penerbit tanpa validasi kebutuhan.

### 5.2 Pembayaran Midtrans

- Integrasikan **Midtrans Snap** untuk checkout versi awal.
- Harga, diskon, dan total pesanan dihitung ulang di backend; jangan percaya nilai total dari browser.
- Simpan snapshot harga per `order_items` agar perubahan harga buku tidak mengubah catatan transaksi lama.
- Simpan identitas transaksi provider, status lokal, status provider, timestamp, dan event audit yang diperlukan.
- Webhook harus **diverifikasi** (signature dan/atau status melalui mekanisme dokumentasi Midtrans yang sesuai), **idempotent**, aman terhadap retry, dan mampu menangani event yang tidak berurutan.
- Jangan mengaktifkan hak akses buku hanya karena redirect browser atau halaman bertuliskan “sukses”.
- Gunakan transaksi DB untuk perubahan status order, entitlement, dan pencatatan pendapatan yang perlu konsisten. Hindari penggandaan grant/saldo saat webhook yang sama datang berulang.
- Rancang alur pending, failed, expired, canceled, refund/chargeback sesuai dukungan provider dan kebijakan IKAPI.
- Server key dan secret hanya berada di server/environment secret; jangan pernah diekspos ke frontend/repo.

### 5.3 Saldo dan pencairan penerbit

- **Pembayaran pembeli ≠ pencairan penerbit.** Dana masuk ke pengelola merchant sesuai perjanjian; aplikasi harus menghitung hak ekonomi setiap penerbit secara terpisah.
- Gunakan pola pencatatan **ledger / immutable financial entries** yang dapat diaudit, bukan hanya satu kolom `balance` yang ditimpa setiap transaksi.
- Perhitungkan item dari berbagai penerbit dalam satu order; tentukan komisi, fee, refund, pajak (bila berlaku), biaya transfer, dan waktu dana bisa dicairkan berdasarkan keputusan bisnis tertulis.
- Pisahkan saldo *pending*, *available*, dan *already paid* bila memang diperlukan dalam model keuangan yang disetujui.
- Payout request perlu status, approval, aktor, tanggal, referensi transfer, dan bukti pembayaran; lindungi dari pencairan ganda dan race condition.
- **Tahap awal:** pencairan disetujui admin dan ditransfer melalui prosedur operasional resmi, lalu direkonsiliasi di aplikasi.
- **Tahap lanjutan (opsional):** Midtrans Payouts, hanya setelah memastikan kelayakan merchant, produk tersedia, biaya, API, dan persyaratan hukum/operasional. Jangan mengasumsikan Snap otomatis membagi dana ke semua penerbit.

### 5.4 Keamanan PDF dan e-book reader

Persyaratan proposal: PDF asli diunggah penerbit dan **tidak diberikan sebagai unduhan langsung kepada pembeli**.

**Arsitektur yang disarankan:**

1. Upload PDF ke penyimpanan privat melalui server/backend yang terotorisasi.
2. Validasi ukuran, isi file/MIME, hak penerbit, dan pemeriksaan keamanan; lakukan pemrosesan file tidak tepercaya secara terisolasi.
3. Simpan PDF asli secara privat dan jalankan background job untuk mengubah halaman menjadi gambar/tiles yang cocok untuk web.
4. Backend memastikan pembeli memiliki `book_entitlement` sebelum menyajikan turunan halaman; otorisasi berlaku untuk tiap permintaan yang relevan.
5. React reader menampilkan halaman secara bertahap (lazy load), dengan navigasi, bookmark, dan pengalaman mobile yang baik.
6. Terapkan rate limit, logging yang proporsional, watermark individual apabila disetujui, dan kontrol akses yang tepat.

**Larangan dan batasan:**

- Jangan menyajikan file PDF asli dari bucket publik.
- Jangan mengira menghapus tombol download pada PDF.js mencegah file PDF disalin. **PDF.js bukan DRM**; jika browser memperoleh file asli, file itu pada prinsipnya dapat disimpan.
- Signed URL langsung menuju **PDF asli** juga memungkinkan pengambilan PDF oleh penerima URL selama URL masih berlaku.
- Tampilan berbasis gambar/tiles **mengurangi paparan PDF asli**, bukan menjamin tidak ada screenshot, pengambilan gambar, atau penyalinan.
- Pertimbangkan aksesibilitas, keterbacaan, beban storage, dan latensi reader; uji pada PDF panjang dan perangkat mobile.

### 5.5 Upload file &amp; OWASP

- Validasi tipe dari isi file dan pembatasan ukuran; jangan percaya ekstensi/nama file pengguna.
- Simpan dengan nama internal yang aman, tidak langsung dapat diakses publik.
- Lakukan pemrosesan PDF di worker terisolasi dengan batas resource yang sesuai.
- Gunakan CSRF protection, parameter binding/ORM, rate limiting, validation, dan output escaping yang relevan.
- Hindari menyimpan password plaintext, API secret, nomor rekening tanpa perlindungan, atau data sensitif di log.

---

## 6. Koreksi yang Perlu Dilakukan terhadap ERD Awal

`ERD.drawio` adalah rancangan awal; sebelum migration production, audit relasi, cardinality, constraint, dan model keuangan.


| Area               | Arah desain                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identitas          | Satu sumber identitas `users` dengan role/permission; profil pembeli/penerbit sesuai kebutuhan. Jangan menduplikasi password di beberapa entitas. |
| Penerbit           | `publishers` dan relasi anggota/owner ke user, sehingga pemisahan data dan pengelolaan staf jelas.                                                |
| Katalog            | `books`, `categories`, `authors`, `book_authors`, aset PDF/cover, status moderasi, dan kepemilikan penerbit.                                      |
| Pesanan            | `orders` + `order_items` dengan snapshot harga per buku dan penerbit pada waktu transaksi.                                                        |
| Pembayaran         | `payments` + `payment_events`/log terkontrol untuk rekonsiliasi status.                                                                           |
| Kepemilikan e-book | `book_entitlements` sebagai representasi hak baca setelah pembayaran tervalidasi.                                                                 |
| Keuangan           | `publisher_ledger_entries`, `payout_requests`, referensi pencairan/transfer, dan audit.                                                           |
| Reader             | `book_assets`/`book_files`, `reading_progress`, dan `bookmarks` bila disetujui.                                                                   |
| Sosial/event       | `reviews`, forum/event bila termasuk ruang lingkup yang telah diputuskan.                                                                         |


Ini merupakan **rekomendasi model konseptual**, bukan perintah untuk membuat semua tabel tanpa analisis. Nama tabel/atribut final harus disesuaikan dengan aturan bisnis, kebutuhan laporan, dan constraint database.

---

## 7. Standar Frontend &amp; UX

- Gunakan **React + TypeScript**, Tailwind, dan **shadcn/ui** sebagai fondasi; komponen reusable, responsive, accessible, dan konsisten antarhalaman.
- UI publik mencakup katalog, detail buku, keranjang, checkout, riwayat, perpustakaan, dan e-book reader.
- UI penerbit mencakup manajemen katalog, status moderasi, penjualan, pendapatan, dan pengajuan pencairan.
- UI admin internal memakai Filament untuk percepatan operasi; jangan memaksakan Filament pada pengalaman pembeli.
- Sediakan state loading, empty, error, permission denied, processing, pending payment, dan success yang benar.
- Gunakan halaman SSR/metadata sesuai kebutuhan SEO katalog dan uji hasilnya secara nyata.
- Hindari UI generik yang tidak relevan, komponen duplikat, hardcoded dummy data di production, dan ketergantungan library UI baru tanpa alasan.
- Jangan menyisipkan link navigasi atau fitur di luar ruang lingkup yang diminta.

---

## 8. Testing, Quality Gates, dan Operasional

### Pengujian yang wajib ada

- Unit tests untuk harga, kalkulasi revenue per penerbit, fee/komisi, dan status saldo.
- Feature/integration tests untuk registrasi/verifikasi, katalog, checkout, webhook, entitlement, payout, dan pembatasan tenant.
- Pengujian **webhook duplikat dan out-of-order**: satu pembayaran tidak menggandakan hak baca atau pendapatan.
- Pengujian pembelian multi-penerbit, perubahan harga setelah order dibuat, refund, pembayaran gagal/expired, dan race condition pencairan.
- Pengujian akses file: pembeli tidak dapat membaca buku yang belum dibeli; publisher A tidak dapat mengubah/membaca data publisher B.
- UAT/black-box testing sesuai proposal, termasuk skenario operasional admin dan serah terima.

### CI/CD dan deploy

- **GitHub Actions:** install dependency terkunci, static checks/lint, TypeScript check, test suite, build frontend; deploy hanya setelah gate penting lolos.
- **Linux VPS + Nginx + PHP-FPM** untuk aplikasi dan asset production. Jalankan queue worker secara terkelola (misalnya systemd/supervisor) dan scheduler Laravel jika diperlukan.
- **PostgreSQL** memiliki prosedur backup berkala, verifikasi restore, dan proteksi kredensial.
- **R2/private object storage** menggunakan kredensial server-side; pastikan kebijakan akses, retensi, dan restore terdokumentasi.
- **Redis bersifat kondisional**: database queue/cache boleh digunakan pada awal jika sesuai dengan beban, lalu migrasikan berdasar kebutuhan nyata.
- Gunakan `.env.example` tanpa secret; `.env` asli dan credential production tidak masuk Git.
- Buat `Dockerfile` untuk opsi build/deployment container, tetapi jangan mewajibkan instalasi Docker lokal apabila alur pengembangan dan deployment tidak memerlukannya.
- Sertakan health checks, error logs, webhook monitoring, dan prosedur recovery. Simpan bukti transfer/payment log secukupnya dengan pembatasan akses dan retensi yang tepat.

---

## 9. Tahapan Implementasi (Urutan Prioritas)

1. **Fondasi:** bootstrap Laravel starter kit React/Inertia, PostgreSQL, migration awal, auth, roles, policies, publisher membership.
2. **Katalog:** publisher upload/approval, buku, penulis/kategori, pencarian, katalog publik, keranjang.
3. **Transaksi:** create order, snapshot harga, Midtrans Snap, verified webhook, idempotency, invoice, earnings ledger dasar.
4. **Perpustakaan:** entitlement, private PDF processing, reader halaman, library, bookmark jika disetujui.
5. **Finansial:** laporan publisher, saldo, withdrawal/payout requests, approval, transfer evidence, audit trail.
6. **Hardening dan serah terima:** end-to-end business scenarios, security tests, UAT, monitoring, backup/restore, dokumentasi dan pelatihan IKAPI.

Tahapan ini adalah **urutan prioritas teknis**, bukan pengganti jadwal formal enam bulan pada proposal.

---

---

## 11. Aturan untuk AI Coding Agent (Wajib Dibaca)

1. **Jangan mengganti stack yang telah ditetapkan** tanpa permintaan eksplisit pemilik proyek. Jika ada masalah kompatibilitas, jelaskan bukti, dampak, dan alternatif sebelum melakukan perubahan arsitektur.
2. **Baca proposal, use case, dan ERD terlebih dahulu** bila tersedia dalam repository. Anggap proposal sebagai referensi utama scope; perlakukan use case sebagai rancangan fitur yang perlu prioritas, dan ERD sebagai draft untuk diperbaiki, bukan kebenaran yang tidak boleh diubah.
3. **Jangan mengarang keputusan bisnis.** Bila komisi platform, pembagian fee, pajak, aturan refund, metode pencairan, dan batasan lisensi PDF belum ditetapkan, buat keputusan teknis minimum yang reversible, tandai sebagai `OPEN DECISION`, dan mintakan konfirmasi sebelum menyelesaikan alur keuangan produksi.
4. **Jangan mendesain aplikasi marketplace buku fisik** jika tidak diminta. Tidak ada asumsi stok, gudang, kurir, ataupun pengiriman.
5. **Jaga integritas transaksi.** Payment verification, entitlement, earnings, dan payouts harus aman terhadap duplikasi, concurrent requests, kegagalan parsial, dan race condition.
6. **Keamanan adalah persyaratan backend, bukan sekadar UI.** Terapkan object-level authorization, validasi, secure storage, dan least privilege.
7. **PDF asli tidak boleh disediakan ke browser pembeli.** Ketiadaan tombol download saja tidak memenuhi kebutuhan ini. Jujur tentang batas teknologi antipembajakan.
8. **Utamakan komponen siap pakai dan konsistensi UI**, tetapi jangan memaksakan library yang tidak kompatibel. Tidak membuat UI asal jadi/AI slop, tidak menambah fitur atau navigasi tanpa izin.
9. **Jangan overengineer.** Mulai dari modular monolith dengan fitur Laravel bawaan; gunakan layanan tambahan hanya jika kebutuhan, metrik, atau constraint membenarkannya.
10. **Pastikan kode dapat diuji dan dipelihara.** Buat migration, test, validasi, kebijakan akses, dokumentasi dan langkah operasional. Perbarui checklist/todo hanya untuk pekerjaan yang benar-benar selesai.
11. **Selalu laporkan hasil pekerjaan secara spesifik:** file yang diubah, keputusan teknis, cara pengujian, hasil test, risiko yang tersisa, dan `OPEN DECISION` yang belum selesai.
12. **Jangan menyatakan production-ready tanpa bukti.** Keamanan finansial, compliance, storage PDF, backup/restore, dan integrasi Midtrans memerlukan pengujian serta persetujuan operasional nyata.

---

## 12. Open Decisions Sebelum Production

Keputusan berikut belum dapat dipastikan hanya dari pemilihan stack dan wajib disepakati bersama pemilik proyek/mitra:

- Siapa pemegang akun merchant Midtrans dan pemilik dana sementara?
- Berapa komisi platform dan siapa menanggung fee transaksi/transfer?
- Kapan saldo penerbit menjadi tersedia, minimum payout, jadwal pencairan, dan siapa yang menyetujui?
- Bagaimana kebijakan refund/chargeback memengaruhi hak baca dan saldo penerbit?
- Apakah penerbit dapat mempunyai banyak staf, dan siapa boleh mengubah rekening payout?
- Apakah akses e-book berlaku selamanya atau mengikuti lisensi/masa berlaku tertentu?
- Apakah forum, event, rating, review, dan fitur tambahan use case termasuk MVP atau fase berikutnya?
- Di mana aplikasi dan file dihosting setelah serah terima, serta siapa operator backup, incident response, dan biaya layanan?
- Apakah layanan Midtrans Payouts dapat diaktifkan untuk entitas merchant yang ditunjuk?

**Jangan menyamarkan keputusan yang belum ditetapkan sebagai best practice yang sudah disetujui.**

---

## 13. Referensi Resmi Teknis

Referensi ini merupakan pintu masuk verifikasi implementasi; baca versi dokumentasi yang tepat dan periksa perubahan sebelum mengunci dependency.

- Laravel 13 — [https://laravel.com/docs/13.x](https://laravel.com/docs/13.x)
- Laravel Starter Kits — [https://laravel.com/docs/13.x/starter-kits](https://laravel.com/docs/13.x/starter-kits)
- Laravel Authorization — [https://laravel.com/docs/13.x/authorization](https://laravel.com/docs/13.x/authorization)
- Laravel Queues — [https://laravel.com/docs/13.x/queues](https://laravel.com/docs/13.x/queues)
- Inertia.js — [https://inertiajs.com/](https://inertiajs.com/)
- React — [https://react.dev/](https://react.dev/)
- TypeScript — [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- Tailwind CSS — [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- shadcn/ui — [https://ui.shadcn.com/](https://ui.shadcn.com/)
- Filament — [https://filamentphp.com/docs/5.x](https://filamentphp.com/docs/5.x)
- PostgreSQL — [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- Midtrans Documentation — [https://docs.midtrans.com/](https://docs.midtrans.com/)
- Cloudflare R2 — [https://developers.cloudflare.com/r2/](https://developers.cloudflare.com/r2/)
- OWASP Authorization Cheat Sheet — [https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- OWASP File Upload Cheat Sheet — [https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

**Ringkasan keputusan:** Laravel 13 + React 19 + TypeScript + Inertia.js 3 + Tailwind CSS 4 + shadcn/ui + PostgreSQL 18 + Eloquent + Fortify + Policies/Spatie + Filament 5 (admin) + Midtrans Snap + private S3-compatible storage + backend PDF processing/React reader + Laravel Queue + Pest/PHPUnit + VPS/Nginx/PHP-FPM + GitHub Actions. Gunakan **modular monolith**, **verifikasi pembayaran di backend**, **entitlement untuk hak baca**, dan **ledger untuk pendapatan penerbit** sebagai fondasi arsitektur.