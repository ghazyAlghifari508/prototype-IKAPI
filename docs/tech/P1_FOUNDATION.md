# P1: Project Initialization & Scaffolding

## A. Documentation Review

Delapan sumber ditinjau: `BPMN AS IS.drawio`, `bpmn_tobe_fixed2.drawio.png`,
`ERD.drawio`, `Proposal_Abdimas_Online_Bookstore_IKAPI_Jabar_REVISI_FORMAT_ASLI (2).pdf`,
`SCENARIO USE CASE_TERBARU.docx`, `SKEMA RELASI.drawio`, `USE CASE.drawio`, dan
`TECH_STACK_IKAPI_MARKETPLACE.md`. Diagram Draw.io diperiksa melalui XML,
node, label, konektor, dan arah relasi; PNG ditinjau visual. Proposal 16 halaman
mencakup teks, tabel, dan gambar rancangan; DOCX ditinjau termasuk alternative flow.
Spesifikasi asli tidak diubah; hash ketujuh berkas `docs/spec` tetap sama.

As-Is: penemuan penerbit, pembelian, dan pembayaran tersebar pada kanal penerbit.
To-Be: satu marketplace digital untuk pembeli, penerbit, dan administrator IKAPI.
Pembayaran memicu hak baca setelah verifikasi backend; pendapatan/pencairan
penerbit merupakan proses berbeda dari pembayaran pembeli. PDF asli harus privat.

Arsitektur: satu aplikasi Laravel, React melalui Inertia, Eloquent/PostgreSQL,
queue/cache/session database. Filament terpisah sebagai area admin di aplikasi
Laravel yang sama. Tidak ada REST API paralel atau microservices.

Skeleton domain yang dibuat: Identity, Publishers, Catalog, Cart, Orders,
Payments, Library, Reader, Payouts. Folder belum berisi implementasi bisnis.
Frontend mempertahankan components/layouts/pages/hooks/types/lib resmi dan
menambahkan features minimal. Tidak ada service/repository/interface kosong.

Open issues bisnis, tidak diputuskan dalam P1:

- ERD dan skema relasi masih rancangan awal. Identitas tunggal, anggota penerbit,
  multi-penerbit per order, entitlement, snapshot harga, dan ledger perlu audit
  sebelum migration bisnis, sesuai koreksi dalam dokumen stack.
- Forum, event, berita, review, bookmark, dan balasan penerbit pada dokumen use case
  bukan otomatis fitur inti yang disetujui.
- Komisi, fee, refund, pajak, minimum/waktu payout, dan batas kewenangan admin
  memerlukan keputusan bisnis tertulis sebelum implementasi.
- Reader tidak boleh menyerahkan PDF asli. Turunan halaman mengurangi paparan,
  bukan jaminan DRM atau pencegahan screenshot.

## B. Technical Stack Installed

| Teknologi                       | Versi aktual                   | Status                                    |
| ------------------------------- | ------------------------------ | ----------------------------------------- |
| PHP portable                    | 8.4.27                         | Bootstrap dan HTTP terverifikasi          |
| Composer                        | 2.9.2                          | Install/validate/platform check lulus     |
| Laravel / Eloquent              | 13.40.0                        | Bootstrap, migration, HTTP lulus          |
| Laravel Fortify                 | 1.41.0                         | Auth starter dan suite lulus              |
| Inertia Laravel / React adapter | 3.7.0 / 3.11.0                 | Build dan respons starter lulus           |
| React / React DOM               | 19.3.1                         | Build dan type check lulus                |
| TypeScript                      | 5.9.3                          | Type check lulus                          |
| Tailwind CSS                    | 4.3.4                          | CSS production/dev dihasilkan             |
| shadcn/ui                       | Source components dari starter | `components.json`, Radix, alias tersedia  |
| Vite+ / Vite core               | 1.4.0                          | Tooling official starter, build/dev lulus |
| Spatie Laravel Permission       | 8.3.2                          | Migration, trait, akses panel diuji       |
| Filament                        | 5.11.1                         | Panel dasar dan otorisasi diuji           |
| PostgreSQL portable             | 18.6                           | Koneksi, migration, test lulus            |
| Pest / PHPUnit                  | 5.3.5 / 13.4.5                 | 42 tests, 144 assertions lulus            |
| Pint / Larastan                 | 1.32.1 / 3.14.0                | Format dan analisis lulus                 |
| Node.js / npm                   | 24.20.0 / 12.0.2               | Install, build, dev lulus                 |

Starter resmi: `laravel/react-starter-kit` commit
`98d9b821baba4f4cc4120c96d35971366cec53e6`.
Versi stabil/kompatibilitas diperiksa melalui dokumentasi resmi dan metadata
package sebelum instalasi. Lockfile menentukan dependency aktual.
Pest 5 memerlukan PHPUnit 13; constraint PHPUnit disesuaikan, bukan menggunakan
versi 12 bawaan snapshot. `laravel/chisel` dilepas setelah installer fitur resmi
menyelesaikan pilihan autentikasi dan menghapus command instalasinya.

Belum diintegrasikan: Midtrans Snap/Payouts, R2/S3 private, PDF processing,
reader, Redis, search bisnis/pg_trgm, SMTP production. Tidak ada blocker
kompatibilitas dependency wajib yang ditemukan.

## C. Project Structure

Struktur aktual dan cara menjalankannya tersedia di [README](../../README.md).
Provider panel berada di `app/Providers/Filament/AdminPanelProvider.php`.
`app/Models/User.php` menerapkan `FilamentUser` dan trait `HasRoles`.
`tests/Feature/AdminAccessTest.php` menguji batas otorisasi panel; tes auth/settings
starter dipertahankan. `tests/Pest.php` mengaktifkan Pest. Tes Unit contoh yang
hanya menguji `true` dihapus; belum ada unit bisnis yang perlu diuji.

## D. Configuration

- `.env.example`: PostgreSQL 18, database driver untuk session/cache/queue,
  mail log, local storage, tanpa secret/integrasi yang belum digunakan.
- `.env` diabaikan Git, mengarah ke cluster baru terisolasi pada loopback port
  `49829`. Database development dan test dibuat terpisah, tanpa menggunakan
  kredensial PostgreSQL milik pengguna atau mengubah instalasi PostgreSQL 17.
- `phpunit.xml`: PostgreSQL dan database `ikapi_marketplace_test` dipaksa;
  `DB_URL` dikosongkan untuk mencegah override database. Jangan jalankan tes
  pada database bernilai; suite memakai RefreshDatabase.
- Enam migration infrastruktur: users, cache, jobs, passkeys, 2FA, permission.
  Tidak ada migration ERD atau seed akun/role/permission bisnis.
- `/admin` menolak pengguna tanpa email terverifikasi dan permission eksplisit
  `access-admin-panel`, termasuk pada environment local. Tidak ada admin default.
- Quality: Pint, Larastan level 7, TypeScript, formatter/linter Vite+ bawaan.
  Tidak menambahkan formatter/linter yang tumpang tindih.
- CI `.github/workflows/tests.yml`: PHP 8.4, Node 24, PostgreSQL 18 service,
  composer validate/install, migration, PHP lint/types, npm ci, Wayfinder,
  frontend quality/types/build, backend tests. Hak token read-only, tanpa deploy.
- Target Linux Nginx/PHP-FPM didokumentasikan di README. Dockerfile belum
  dibutuhkan untuk target tersebut; tidak memasang Docker atau membuat deployment.

## E. Verification Results

Pemeriksaan lokal yang benar-benar dijalankan:

| Perintah / skenario                              | Hasil                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `composer install`, `npm install`, lalu `npm ci` | Instalasi ulang lockfile berhasil; dua lockfile tersedia                                   |
| `composer validate --strict`                     | Lulus                                                                                      |
| `composer check-platform-reqs`                   | Lulus                                                                                      |
| `php artisan about --only=environment,drivers`   | Laravel 13, PHP 8.4, pgsql/database drivers                                                |
| `php artisan migrate` dan `migrate:status`       | Enam migration pada database baru berhasil                                                 |
| `composer lint:check`                            | 58 file PHP lulus                                                                          |
| `composer types:check`                           | Larastan tanpa error                                                                       |
| `npm run check`                                  | Formatting dan lint lulus                                                                  |
| `npm run types:check`                            | Lulus                                                                                      |
| `npm run build`                                  | 2336 modul, aset production dihasilkan                                                     |
| `php artisan test --compact --colors=never`      | 42 tests, 144 assertions lulus                                                             |
| `composer test`                                  | Pint, Larastan, dan 42 tests/144 assertions lulus sesudah instalasi ulang                  |
| Regresi akses admin sebelum/sesudah              | Sebelum: user local memperoleh 200, expected 403. Sesudah: tiga tes, tujuh assertion lulus |
| HTTP CLI pada server Laravel aktual              | `/up`, `/`, `/login`, `/admin/login`: 200; `/admin`: redirect login                        |
| Development Vite HTTP                            | `/@vite/client`, `/resources/js/app.tsx`, `/resources/css/app.css`: 200                    |
| HTTP setelah Vite dihentikan                     | Welcome/login/admin-login: 200, welcome memakai `/build/assets/`                           |
| `config:cache`, `route:cache`, `view:cache`      | Lulus; cache dikembalikan ke kondisi development                                           |
| `npm audit --omit=dev`                           | Nol vulnerability dependency production                                                    |
| `composer audit`                                 | Nol advisories dari cache; refresh Packagist timeout                                       |

Tidak ada browser QA/Playwright atau subagent. HTTP diperiksa melalui CLI,
bukan bukti visual/interaksi browser. Workflow GitHub Actions disiapkan tetapi
belum dieksekusi di GitHub; hasil lokal bukan klaim CI remote lulus.

## F. Outstanding Issues

- Runtime PHP/PostgreSQL portable berada di temporary directory. Instalasi
  permanen/PATH dan restart cluster setelah sesi harus ditangani lokal.
- Build memberi warning optional `fontaine` untuk optimized font fallback.
  Build, CSS, dan font self-hosted berhasil; fitur optimasi opsional ini belum aktif.
- Percobaan Vite melalui supervised harness mewarisi penanda CI dan ditolak
  plugin Laravel. Smoke lokal berikutnya tanpa penanda CI berhasil; tidak ada
  bypass CI yang ditambahkan ke repository.
- Audit Composer menggunakan cache karena refresh Packagist timeout; tidak boleh
  dianggap pembuktian database advisories terbaru. Audit npm hanya scope production.
- GitHub Actions remote, browser visual QA, deployment Linux, SMTP production,
  dan integrasi layanan eksternal belum diuji. Browser QA dilarang oleh P1.
- Tidak ada akun admin. Provisioning eksplisit dan aturan bisnis dibahas pada
  fase implementasi terkait, bukan di-seed sekarang.

## G. Final Checklist

- [x] Delapan dokumen ditinjau; spesifikasi asli dipertahankan.
- [x] Laravel 13, official React starter, Inertia 3, Tailwind 4, shadcn/ui tersedia.
- [x] Skeleton modular monolith minimal tanpa fitur bisnis.
- [x] PostgreSQL 18 terhubung; migration aman pada database baru.
- [x] Fortify, Spatie, panel Filament dasar dengan otorisasi eksplisit.
- [x] Environment aman, quality tooling, tests, lockfile, CI dasar.
- [x] Build, lint, type check, tests, HTTP dev/production terverifikasi lokal.
- [x] README setup, production requirements, batas verifikasi, open issues.
- [x] Tidak membuat prototype, mock bisnis, skema ERD, atau integrasi production.

## H. Next Phase Readiness

Fondasi siap untuk fase Frontend Interactive Prototype menggunakan mock data,
setelah runtime lokal aktif. P2 tidak dikerjakan. Isu bisnis yang tercatat tidak
menghalangi prototype, tetapi harus diselesaikan sebelum implementasi transaksi,
hak baca, dan payout production.

Referensi resmi: [Laravel starter kits](https://laravel.com/docs/13.x/starter-kits),
[starter source](https://github.com/laravel/react-starter-kit/tree/98d9b821baba4f4cc4120c96d35971366cec53e6),
[Spatie prerequisites](https://spatie.be/docs/laravel-permission/v8/prerequisites),
[Filament installation](https://filamentphp.com/docs/5.x/introduction/installation),
[Laravel deployment](https://laravel.com/docs/13.x/deployment),
[Pest installation](https://pestphp.com/docs/installation).
