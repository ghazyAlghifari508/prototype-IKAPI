# Prototype-IKAPI

Repository untuk prototype proyek IKAPI.

## Status P1

Fondasi Laravel terpasang; belum ada prototype atau fitur marketplace. Halaman
welcome, dashboard kosong, autentikasi, dan settings berasal dari starter kit
resmi. P2 belum dimulai.

Stack terkunci di `composer.lock` dan `package-lock.json`: Laravel 13, PHP 8.4,
React 19, Inertia 3, TypeScript, Tailwind 4, shadcn/ui, Filament 5, dan Spatie
Permission 8. Detail versi, analisis dokumen, dan hasil verifikasi terdapat di
[laporan P1](docs/tech/P1_FOUNDATION.md).

## Prasyarat

- PHP 8.4 dengan `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `hash`, `intl`,
  `mbstring`, `openssl`, `pcre`, `pdo`, `pdo_pgsql`, `session`, `tokenizer`, `xml`,
  `xmlreader`, `xmlwriter`, `zip`, dan `gd`.
- Composer 2, Node.js 24, npm, Git, PostgreSQL 18.
- Dua database lokal kosong: `ikapi_marketplace` dan `ikapi_marketplace_test`.
  Jangan gunakan database production atau database aplikasi lain.

## Instalasi lokal

1. Jalankan `composer install` dan `npm ci`.
2. Salin `.env.example` menjadi `.env` jika belum ada. Isi host, port, user, dan
   password PostgreSQL milik Anda. Jangan commit `.env`.
3. Buat kedua database melalui PostgreSQL menggunakan akun yang berwenang.
4. Jalankan:

   ```sh
   php artisan key:generate --skip-if-set
   php artisan migrate
   php artisan wayfinder:generate --with-form
   npm run build
   ```

`composer setup` menggabungkan instalasi, pembuatan key, migration, dan build.
Konfigurasikan `.env` serta database terlebih dahulu. Migration hanya mencakup
infrastruktur starter kit dan permission, bukan ERD bisnis. Seeder tidak membuat
akun dummy.

Untuk development, gunakan dua terminal:

```sh
php artisan serve
npm run dev
```

Buka `http://localhost:8000`. Alternatif official starter: `composer dev`.
Queue dapat dijalankan terpisah dengan `php artisan queue:work --tries=1`;
belum ada job bisnis. Untuk memeriksa aset production, hentikan Vite lalu jalankan
`npm run build`; Laravel menyajikan aset dari `public/build`.

Pada mesin pengerjaan, PHP 8.4 dan PostgreSQL 18 portable berada di direktori
temporary Windows, bukan instalasi global/PATH. `.env` lokal mengarah ke cluster
baru pada port `49829`. Setelah restart sesi atau pembersihan temporary files,
jalankan kembali cluster tersebut atau pasang runtime permanen dan sesuaikan
`.env`. PostgreSQL 17 yang sudah ada tidak diubah.

## Pemeriksaan kualitas

```sh
composer validate --strict
composer check-platform-reqs
composer lint:check
composer types:check
php artisan wayfinder:generate --with-form
npm run check
npm run types:check
npm run build
php artisan test
```

`npm run check` menggunakan formatter dan linter bawaan Vite+ official starter,
bukan ESLint/Prettier tambahan. `composer lint` memperbaiki format PHP;
`npm run check:fix` memperbaiki format/lint frontend. Dokumen spesifikasi asli
dikecualikan dari formatter.

Tes menggunakan PostgreSQL `ikapi_marketplace_test`; koneksi, nama database, dan
`DB_URL` dikunci di `phpunit.xml`. Host, port, user, dan password mengikuti `.env`
atau environment. Tes memakai migration/transaction dan dapat mengubah database
test: jangan isi database tersebut dengan data berharga. GitHub Actions menyediakan
service PostgreSQL 18 terisolasi; workflow tidak melakukan deployment.

## Struktur

```text
app/
  Domain/{Identity,Publishers,Catalog,Cart,Orders,Payments,Library,Reader,Payouts}/
  Http/                    # controller, request, middleware starter kit
  Models/User.php
  Providers/Filament/AdminPanelProvider.php
database/{migrations,factories,seeders}/
resources/js/{components,features,hooks,layouts,lib,pages,types}/
routes/
tests/{Feature,Unit}/
docs/{prompts,spec,tech}/
.github/workflows/tests.yml
```

Domain dan `resources/js/features` hanya berisi `.gitkeep`. Belum ada service,
repository, model bisnis, atau policy objek bisnis. `@/*` menunjuk ke
`resources/js/*`; route/action TypeScript dihasilkan Wayfinder dan tidak di-commit.

## Authentication dan admin

Fortify mempertahankan registration, login, reset password, verifikasi email,
password confirmation, 2FA, dan passkeys dari starter kit. Email development
masuk log, bukan SMTP production. Tidak ada login multi-role atau akun default.

Panel dasar Filament di `/admin` memakai session guard `web`. Akses mensyaratkan
email terverifikasi dan permission Spatie `access-admin-panel`, termasuk dalam
environment lokal. Tidak ada permission/role yang di-seed, sehingga registration
publik tidak memberi akses admin. Provisioning administrator harus dilakukan
secara eksplisit oleh pengelola ketika dibutuhkan; `make:filament-user` saja tidak
memberikan permission ini. Policies/Gates Laravel tetap dipakai untuk otorisasi
objek ketika fitur bisnis dibuat, bukan mengandalkan tombol UI atau role saja.

## Target production

Linux VPS, Nginx, PHP-FPM 8.4, dan PostgreSQL 18. Arahkan document root hanya ke
`public/`; berikan akses tulis terbatas ke `storage/` dan `bootstrap/cache/`.
Gunakan `APP_ENV=production`, `APP_DEBUG=false`, secret dari environment, HTTPS,
session cookie aman, backup, dan user database dengan hak minimum.

Bangun aset dengan `npm ci && npm run build`, pasang dependency PHP dengan
`composer install --no-dev --optimize-autoloader`, lalu jalankan migration terkontrol
dan `php artisan optimize`. Jalankan worker melalui process supervisor saat job
sudah digunakan. Runtime production tidak membutuhkan Vite dev server, Pail,
Docker lokal, atau runtime SSR. Dockerfile ditunda karena packaging container
belum dibutuhkan. Belum ada deployment, konfigurasi VPS/domain/SSL, payment,
R2, PDF processing, reader, Redis, atau SMTP production.
