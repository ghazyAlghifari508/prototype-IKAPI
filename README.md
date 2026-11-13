# IKAPI Jawa Barat — Marketplace

Prototype marketplace & katalog penerbit IKAPI Jawa Barat.

## Stack

- Laravel 13 (PHP 8.4)
- Blade + Tailwind CSS 4 (Vite 6)
- Alpine.js + Axios
- MySQL 8

## Prasyarat

- PHP 8.4 dengan `pdo_mysql`, `intl`, `mbstring`, `zip`, `gd`
- Composer 2, Node.js 24, MySQL 8
- Database kosong: `ikapi_marketplace` dan `ikapi_marketplace_test`

## Instalasi lokal

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
```

Sesuaikan kredensial MySQL di `.env`. Jangan commit `.env`.

Development:

```sh
php artisan serve
npm run dev
```

## Pemeriksaan

```sh
composer lint:check
php artisan test
npm run build
```

Tes memakai database `ikapi_marketplace_test`.

## Struktur

```text
app/Models/User.php
database/{migrations,factories,seeders}/
resources/views/welcome.blade.php
resources/{css,js}/
routes/web.php
tests/{Feature,Unit}/
.github/workflows/tests.yml
```
