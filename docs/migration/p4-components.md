# P04 - Shared Layouts, Partials, dan Komponen Blade

Fase: **komponen UI berulang**. Prototype HTML tidak diubah satu byte pun (`git status docs/design/prototype-copy` = 0).
Bukti: `docs/migration/p4-verification.json` (layout), `p4-behaviour.json` (perilaku), `p4-pixel-compare.json` (piksel),
screenshot `docs/migration/baselines/shells/**`.

## 1. Audit source shell (angka, bukan kesan)

| Temuan | Nilai terukur |
|---|---|
| Halaman buyer tanpa `<header>` | 6 dari 22 (login, register, lupa sandi, verifikasi email, onboarding, preview buku) |
| Varian header buyer | **2 varian fungsional**: tamu (Masuk/Daftar/akun) dan anggota (avatar + dropdown 7 item) |
| Perbedaan lain antar header buyer | `z-50` (beranda, katalog, detail, komunitas) vs `z-40` (keranjang, agenda, chatbot, 6 halaman akun); kontainer `max-w-[1360px]` vs `max-w-[1240px]` + `px-4 md:px-8` (chatbot); placeholder pencarian 3 teks berbeda; badge keranjang: hanya 2 halaman memakainya (ids `cart-badge` vs `header-cart-badge`) |
| Footer buyer | **1 markup** (4.650 char) identik di 6 halaman (beranda, katalog, keranjang, bantuan, perpustakaan, riwayat ulasan); 3 halaman akun beda 1 komentar HTML; 2 "footer" di detail buku & komunitas adalah footer modal, bukan footer halaman |
| Auth shell | 4 halaman, kartu 12 kolom: panel ilustrasi `lg:col-span-5` + panel form `lg:col-span-7`; form `max-w-md` (login, lupa, verifikasi) vs `max-w-lg` (register) |
| Portal topbar | identik di **13 dari 14** halaman (hash `64a8d2`); 1 halaman (dashboard penerbit) beda hanya pada target logo + satu kalimat notifikasi |
| Portal sidebar | per persona **1 template**: 8 halaman admin identik kecuali item aktif; 6 halaman penerbit identik kecuali item aktif |
| Banner geometris | SVG **byte-identik di 14/14** halaman portal |
| CSS shell portal | 12 aturan (topbar 64px, sidebar 248px, `.shell-main`, `.banner-bleed`, drawer `.22s`, scrollbar) muncul di **14/14** halaman |
| Modal portal | **16 modal** di 8 halaman memakai frame sama (root `z-70`/`z-80`, backdrop `#222225/45`, panel `max-w-[420/440/460/520]`, `mt-12/16/20/24`) |
| Toast | 2 varian: portal (bawah-tengah, `z-[95]`, 8 halaman, `#toast-text`) dan buyer (kanan-bawah) - hanya varian portal yang dijadikan komponen |
| Book card | 2 varian nyata: `grid` (katalog, kartu berbingkai + chip E-Book + tombol Detail) dan `shelf` (rak beranda, tanpa chrome) |
| Input auth | 9 string kelas berbeda; **2 tone** nyata: `neutral` (buyer/auth, `bg-surface-neutral`) dan `portal` (admin/penerbit, `bg-white`) |

Kesimpulan audit: shell buyer, auth, dan portal **tidak disatukan** karena memang berbeda; yang dijadikan komponen hanya
bagian yang benar-benar identik atau berbeda lewat prop yang terukur.

## 2. Mapping HTML source -> file Blade

| Source HTML | Baris/ukuran | Target | Catatan |
|---|---|---|---|
| `user/beranda_desktop.html` `<header>` (baris 96-138) | 3.788 char | `partials/public/header.blade.php` | markup/kelas disalin verbatim; variabel: `z`, `container`, `account`, `cartCount`, `cartActive`, `currentRoute`, `searchPlaceholder` |
| `user/beranda_desktop.html` `<footer>` (751-809) | 4.650 char | `partials/public/footer.blade.php` | tautan lewat named route; `href="#"` bila rute belum ada |
| `<body>`+`<main>`halaman buyer (22 halaman) | - | `layouts/public.blade.php` | `pt-28`/`pt-32`, `min-h-[calc(100vh-16rem)]`, `selection:` colours, footer opsional |
| `user/masuk_login_desktop.html` dkk. kartu auth | 4 halaman | `layouts/auth.blade.php` | panel ilustrasi + slot konten; `alt` dan lebar form sebagai section |
| `penerbit/dashboard_penerbit_desktop.html` topbar | 26 baris | `partials/portal/topbar.blade.php` | logo + `drop-shadow`, hamburger `lg:hidden`, panel notifikasi |
| `admin/dashboard_administrasi_utama_desktop.html` topbar | 26 baris | idem | prop `notifExtra` untuk halaman penerbit |
| `penerbit/kelola_buku_desktop.html` sidebar (nav-nya) | 57 baris | `partials/portal/sidebar.blade.php` | id `publisher-sidebar` dipertahankan (CSS/JS/golden bergantung padanya); item dari `Navigation::items($persona)` |
| `admin/*` sidebar | 8 halaman | idem | 2 heading seksi + 8 item; tidak ada item penerbit yang bocor (diuji) |
| `*-*` SVG banner portal | 14/14 identik | `partials/portal/banner.blade.php` | polygon & gradien disalin apa adanya |
| `<body class="bg-canvas text-ink">` + `.shell-main` + `<main id="workspace">` | 14 halaman | `layouts/portal.blade.php` | shell bersih; `@yield('overlays')` untuk modal/toast |
| CSS `<style>` portal (12 aturan) | 14/14 | `resources/css/app.css` (blok `.ikapi-portal`) | di-scope agar tidak mengubah halaman buyer |
| 16 modal portal | 8 halaman | `components/ikapi/modal.blade.php` | `id` unik -> `id-title`; 4 lebar, 2 z-index, 4 offset atas |
| Toast portal (8 halaman) | - | `components/ikapi/toast.blade.php` + `js/ikapi/toast.js` | id lama (`toast`, `toast-text`) diganti hook `data-ikapi-toast*` |
| Kartu buku katalog & rak beranda | 2 template | `components/ikapi/book-card.blade.php` | `variant="grid"|"shelf"` |
| Input auth (9 string kelas, 2 tone) | - | `components/ikapi/form-field.blade.php` | label + ikon opsional + baris error |
| `<head>` 38 halaman (font + ikon) | - | `components/ikapi/head.blade.php` | 2 varian URL Material Symbols; Literata opsional |

## 3. Nama, props, slot

### `layouts/public.blade.php`
Section: `title`, `content` (wajib), `header_z` (`z-40`), `header_container` (`narrow`), `account` (`member`),
`cart_count`, `cart_active` (`1`), `current_route`, `search_placeholder`, `main_pt` (`pt-32`), `main_class`, `body_class`, `no_footer`.

```blade
@extends('layouts.public')
@section('title', 'Katalog Buku - IKAPI Store Jawa Barat')
@section('account', 'member')
@section('cart_count', '2')
@section('current_route', 'catalog')
@section('search_placeholder', 'Cari judul buku, penulis, atau topik...')
@section('content') ... @endsection
```

### `layouts/auth.blade.php`
Section: `title`, `alt`, `width` (`lg`), `content`.

```blade
@extends('layouts.auth')
@section('title', 'Masuk - IKAPI Store Jawa Barat')
@section('alt', 'Ilustrasi membaca IKAPI Store')
@section('content')
  <x-ikapi.form-field name="email" label="Alamat Email" type="email" icon="alternate_email" required />
@endsection
```

### `layouts/publisher.blade.php` / `layouts/admin.blade.php`
Tidak menambah section; keduanya `@extends('layouts.portal', [...])` dengan persona masing-masing
(`persona`, `homeRoute`, `navLabel`, `accountHref`, `logoutHref`, `account`, `notifExtra`).
`layouts/portal.blade.php` menyediakan `title`, `content`, `main_extra`, `overlays`.

```blade
@extends('layouts.publisher')            {{-- atau layouts.admin --}}
@section('title', 'Dashboard Penerbit - IKAPI Jawa Barat')
@section('content') ... @endsection
@section('overlays')
  <x-ikapi.modal id="modal-confirm" title="Konfirmasi Pencairan" :width="440" :z="70"> ... </x-ikapi.modal>
  <x-ikapi.toast />
@endsection
```

### `partials/public/header.blade.php`
Variabel (semua opsional, default = halaman beranda): `z`, `container`, `account`, `cartCount`, `cartActive`,
`currentRoute`, `searchPlaceholder`, `accountName`, `accountInitials`, `accountEmail`.

### `partials/public/footer.blade.php` — tanpa variabel; tautan dari registry rute.

### `partials/portal/topbar.blade.php` — `homeRoute`, `notifExtra`.
### `partials/portal/sidebar.blade.php` — `persona`, `navLabel`, `accountHref`, `account` (array `title`/`subtitle`/`icon`), `logoutHref`.
### `partials/portal/banner.blade.php` — tanpa variabel.

### `components/ikapi/head.blade.php`
`title` (wajib), `icons` (`buyer`|`portal`), `serif` (bool).

### `components/ikapi/modal.blade.php`
`id`, `title` (wajib), `width` (`420|440|460|520`), `z` (`70|80`), `top` (`mt-12|mt-16|mt-20|mt-24`); slot default + `footer`.
Id heading diturunkan otomatis (`<id>-title`), jadi tidak ada id ganda walau modal diulang.

### `components/ikapi/book-card.blade.php`
`book` (array fixture), `variant` (`grid`|`shelf`), `href`.
Tombol keranjang membawa atribut prototype (`data-book-id/-title/-price`) supaya P05 tinggal memasang perilaku.

### `components/ikapi/form-field.blade.php`
`name`, `label` (wajib); `type`, `tone` (`neutral`|`portal`), `icon`, `required`, `value`, `placeholder`,
`autocomplete`, `error`, `id`; slot untuk elemen tambahan (mis. tombol lihat sandi).
Id `<id>` dan `<id>-error` dihasilkan otomatis.

### `components/ikapi/toast.blade.php` — tanpa props; satu instance per halaman portal.

## 4. Aturan varian (kenapa begini, bukan DRY buta)

1. **Jangan satukan shell yang berbeda.** Buyer (header fixed 112px + nav tab) vs auth (tanpa header) vs portal (topbar 64px + sidebar 248px) tetap tiga layout; yang dibagi hanya potongan identik.
2. **Satu partial per peran untuk sidebar**, isi dari `App\Support\Navigation::items($persona)`. Item penerbit tidak bisa muncul di admin karena daftarnya per persona (diuji: admin 8 item + 2 heading, penerbit 6 item, 0 tautan karena rute produk belum terdaftar).
3. **Perbedaan yang cuma 1-2 nilai jadi prop**, bukan file baru: `z`, `container`, `notifExtra`, `width`, `tone`.
4. **Rute belum ada tetap jujur**: item menu dengan rute belum terdaftar dirender `<span aria-disabled="true" title="Halaman ini belum dimigrasi">`, bukan `<a href="#">`, supaya tidak ada tautan palsu dan tidak ada "active" palsu. `href="#"` hanya dipakai di footer (perilaku asli prototype juga begitu) — dicatat sebagai risiko R3.
5. **`active` selalu dari route name** (`request()->routeIs()`), atau dari `current_route` bila halaman memakai rute kerja yang berbeda; tidak pernah di-hardcode.
6. **Id yang dipertahankan**: `publisher-sidebar` (CSS/JS/golden P02 bergantung padanya). Id lain diganti hook `data-ikapi-*` agar komponen bisa berulang (`modal` menurunkan `-title`, `form-field` menurunkan `-error`).
7. **Overlay di luar `<main>`.** Modal/toast dirender lewat `@yield('overlays')` di akar `<body>`: `#workspace` memakai `relative z-10` yang membentuk stacking context, sehingga modal di dalamnya tidak bisa menaungi sidebar `fixed z-40`. (Ditemukan saat uji klik backdrop; prototype juga menaruh modal di akhir `<body>`.)

## 3.1 Komponen yang sengaja BELUM dibuat (dengan alasan)

| Kandidat | Alasan belum | Dibuat saat |
|---|---|---|
| `community-card` | Hanya **1 konsumen nyata**: kartu komunitas dibangun oleh JS di `user/komunitas_literasi_desktop.html` (`buildCard`, baris 897); panel admin memakai baris tabel, bukan kartu | Saat halaman komunitas dikonversi (P06) |
| `table-status` | Teks status di prototype selalu **teks berwarna tanpa bg/border**, tetapi markup & kelasnya berbeda per halaman portal (10+ varian) dan belum ada dua halaman identik di Blade | Saat 2 halaman portal pertama dikonversi (P08/P09) |
| `empty-state` | 28 halaman punya state kosong, tetapi markup-nya masih di JS tiap halaman | Bersamaan dengan konversi halaman pemakainya |
| `header-admin` / `header-publisher` terpisah | Topbar terbukti identik 13/14 halaman; memisahkannya justru duplikasi | Tidak akan dibuat; prop `notifExtra` menutup satu-satunya selisih |
| `sidebar-admin` / `sidebar-publisher` terpisah | Isi sidebar per persona sudah ditangani `Navigation::items($persona)`; satu partial + prop lebih kecil risikonya | Tidak akan dibuat |

Aturan yang dipakai: komponen hanya dibuat bila ada **≥2 konsumen nyata** atau pemakaian ulang semantik yang kuat
(prompt bagian 2). Menyalin markup yang belum punya konsumen kedua akan mengunci bentuk komponen sebelum sumbernya terbukti.

## 4.1 Query param dan rute yang belum siap

- Tautan pada shell memakai `route()`; shell tidak menyentuh query string, jadi query resmi (`?komunitas=`, `?topik=`,
  `?balas=`, `?tab=`, `?id=ev-N`, `?role=`, `?next=`) tetap utuh. Validasi ID ada di `resources/js/ikapi/demo/session.js`
  (`idParam()`, `isValidId()`, `safeNext()`).
- Item menu yang rutenya belum terdaftar dirender `<span aria-disabled="true" title="Halaman ini belum dimigrasi">`,
  bukan tautan kosong: diuji 21 item menu di tiga persona berstatus "belum ada", 0 tautan aktif palsu.
- Dropdown akun & footer memakai `href="#"` untuk rute yang belum ada karena prototype juga begitu; dicatat sebagai R3.

## 5. Cara pakai (snippet nyata dari showcase)

```blade
{{-- showcase shell publik: docs/migration -> route ui.shell.public --}}
@extends('layouts.public')
@section('account', request('akun') === 'member' ? 'member' : 'guest')
@section('cart_count', '2')
@section('content')
  <div class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
    @foreach (array_slice($books, 0, 4) as $book)
      <x-ikapi.book-card :book="$book" variant="shelf" />
    @endforeach
  </div>
@endsection
```

```blade
{{-- modal + toast di portal --}}
<button type="button" data-ikapi-modal-open="modal-approve">Buka</button>
<x-ikapi.modal id="modal-approve" title="Setujui Pendaftaran?" :width="440" :z="80">
  <p class="mt-1 text-[13px] leading-relaxed text-muted">...</p>
  <x-slot:footer>
    <button type="button" data-ikapi-modal-close class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
  </x-slot:footer>
</x-ikapi.modal>
```

Hook JS: `data-ikapi-modal-open="<id>"`, `data-ikapi-modal-close`, `data-ikapi-toast`/`data-ikapi-toast-text`
(`IkapiToast.show(msg)`), `data-ikapi-sidebar-toggle`/`-scrim`, `data-ikapi-notif-toggle`/`-panel`,
`data-ikapi-dropdown`/`-toggle`/`-menu`.

## 6. Verifikasi

Rute uji: `GET /ui/shell/{public,auth,publisher,admin,parity}` + `GET /ui/foundation` (P03). Tidak ada rute produk yang didaftarkan.

| Pemeriksaan | Hasil |
|---|---|
| Semua shell HTTP 200, `<html>/<head>/<body>` masing-masing 1, **0 Tailwind CDN**, **0 id ganda** | lulus |
| 0 error JS/console, 0 response ≥400 di 10 render shell | lulus |
| Font `loaded`, DM Sans + Material Symbols aktif | lulus |
| Header 1440x900 vs prototype | **0 piksel berbeda** (`ratio 0`) |
| Header 390x844 vs prototype | **0 piksel berbeda** |
| Footer 1440x900 vs prototype | **0 piksel berbeda** |
| Footer 390x844 vs prototype | **0 piksel berbeda** |
| Ukuran elemen kunci (1440) | header 1440x113, logo 96x32 di (72,16), search 576x40, nav 1296x48, footer 1440x363,5 - **sama dengan prototype** |
| Ukuran elemen portal (1440 / 390) | topbar 64, sidebar 248x836 `fixed z-40`, banner 276 (1440) / 232 (390), workspace x=272 - **sama** |
| Auth (1440) | panel ilustrasi 380x460 di (195,220) - **sama**; kartu 1152x590 vs 1152x750 (isi halaman, bukan shell) |
| Drawer 390 (penerbit & admin) | buka: `x=0`, scrim tampil, `aria-expanded=true`, `body overflow hidden`, fokus ke tautan sidebar; Escape & klik scrim menutup, fokus kembali ke tombol; klik ganda tidak saling membatalkan |
| Modal | fokus pindah ke panel, `aria-modal=true`, `aria-labelledby` -> heading, scroll terkunci, Escape/backdrop/tombol tutup bekerja, fokus kembali ke pemicu |
| Toast | `z-[95]`, `position fixed`, pusat-x 720, jarak bawah 24px, `role=status`, hilang otomatis setelah 2,8 detik |
| Dropdown akun | buka/tutup via klik, Escape, klik luar; `aria-expanded` sinkron |
| Overlay stacking (eksplisit) | dengan modal terbuka, `elementFromPoint` di area sidebar (x=120) mengembalikan **backdrop modal**, bukan sidebar: modal `z-80` menaungi sidebar `fixed z-40`, scroll terkunci |
| Tanpa kebocoran menu | admin 8 item + 2 heading, penerbit 6 item, 0 item silang |
| Urutan Tab (1440, anggota) | logo -> pencarian -> keranjang -> tombol akun -> tab nav -> isi halaman = **sama dengan prototype** |
| Crop gambar kartu buku | `object-fit: cover`, radius 12px, `aspect-ratio: 2/3`, `loading="lazy"`, `alt` terisi - **sama dengan kartu katalog prototype** |
| `phpstan` (level 7) / `pint --test` | 0 error / passed |

Cara reproduksi:

```sh
cd docs/design && python -m http.server 8099 --bind 127.0.0.1     # prototype (referensi)
php artisan serve --host=127.0.0.1 --port=8130                   # aplikasi
P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/verify-shells.mjs
P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/verify-shell-behaviour.mjs
P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/pixel-compare-shell.mjs
node docs/migration/tools/diff-locate.mjs <a.png> <b.png>        # lokasi piksel berbeda
```

## 7. Perbedaan/perubahan yang ditemukan selama P04 (keputusan sadar)

| # | Temuan | Tindakan | Status |
|---|---|---|---|
| P4-1 | Google Material Symbols memuat `.material-symbols-outlined{font-size:24px}` **tanpa layer**; di Tailwind 4 semua utility ada di `@layer utilities`, dan CSS tanpa layer selalu menang, sehingga `text-[20px]`/`text-[18px]` pada ikon **tidak berlaku** (ikon 24px vs 20px di golden) | Stylesheet ikon dimuat di dalam layer (`@import url(...) layer(icons)` + `@layer icons, theme, base, components, utilities;`) sehingga utility Tailwind menang lagi | Diperbaiki; terverifikasi ikon 20/24/18px = prototype |
| P4-2 | Utility warna transparan (`text-white/60`, 46 kombinasi / 395 pemakaian di prototype) dikompilasi v4 jadi `color-mix(in oklab, ...)`; Chromium mengomposit oklab sehingga selisih 1-10/255 vs `rgba()` v3 | (a) token warna jadi `@theme inline` agar nilai fallback = hex-alpha seperti v3; (b) di komponen yang ditulis, kelas alpha memakai bentuk literal (`text-[#ffffff99]`) yang tidak melewati `color-mix` | Diperbaiki untuk komponen P04; dicatat sebagai aturan untuk halaman berikutnya |
| P4-3 | Modal di dalam `<main>` tidak bisa menaungi sidebar (stacking context `relative z-10`) | Overlay dipindah ke `@yield('overlays')` di akar `<body>` | Diperbaiki |
| P4-4 | Footer prototype berada di offset dokumen **pecahan** (3299,594 / 5336,125px) sehingga rasterisasi teks/border beda 1 px dari halaman dengan offset bulat | Skrip pixel-compare memberi offset pecahan yang sama sebelum crop (spacer; hanya alat ukur) | Diperbaiki di alat ukur |
| P4-5 | 2 varian toast (portal bawah-tengah, buyer kanan-bawah) | Hanya varian portal yang jadi komponen; varian buyer dibuat saat halamannya dikonversi | Dicatat |
| P4-6 | Badge keranjang punya 2 id berbeda (`cart-badge`, `header-cart-badge`) dan hanya ada di sebagian halaman | Komponen memakai kelas `.ikapi-cart-badge`; id lama tidak ditiru | Dicatat |

## 8. Risiko

| # | Risiko | Mitigasi |
|---|---|---|
| R1 | `@theme inline` tidak mempublikasikan variabel warna ke `:root` (dikonfirmasi masih tersedia di build ini, tetapi jangan bergantung) | CSS kustom memakai warna literal (seperti `<style>` prototype); jangan menulis `var(--color-*)` di CSS baru |
| R2 | Meniru kelas `[#rrggbbaa]` literal lebih panjang dan bisa salah hitung alpha | Tabel konversi dipakai: 10% `1a`, 20% `33`, 30% `4d`, 40% `66`, 60% `99`, 90% `e6`, 95% `f2` |
| R3 | Footer memakai `href="#"` untuk rute yang belum ada (perilaku asli prototype) | Ganti ke named route saat halamannya dikonversi; registry `Navigation` sudah menandai rutenya siap/belum |
| R4 | `#publisher-sidebar` sengaja dipakai sebagai id tunggal | Jangan menaruh dua shell portal pada satu halaman |
| R5 | Ikon butuh jaringan (Google Fonts) | Sudah dicatat sebagai K5 di P03 |
| R6 | Modal/toast wajib lewat `@yield('overlays')` | Terdokumentasi di header `layouts/portal.blade.php`; showcase mencontohkannya |

## 9. Gate P05

**Gate: "P05 harus dapat memakai shell tanpa mengubah tampilan referensi beranda/katalog/detail" -> LULUS.**
Bukti: header dan footer shell publik **identik piksel (ratio 0)** dengan `user/beranda_desktop.html` pada 1440x900 dan
390x844; ukuran topbar/sidebar/banner/workspace portal sama dengan prototype; seluruh interaksi (drawer, modal, toast,
dropdown) terverifikasi di browser; `phpstan` dan `pint` bersih; 0 error runtime; tidak ada rute produk yang didaftarkan
(Sesuai batas fase).

Untuk P05:

1. Pakai `@extends('layouts.public')` + `@section('content')`; jangan menyalin header/footer.
2. Set `current_route` ke rute menu yang diwakili halaman itu agar tab aktif benar.
3. Gunakan `<x-ikapi.book-card>` untuk daftar buku (varian `grid`/`shelf`) dan `<x-ikapi.form-field>` untuk input.
4. Untuk warna transparan pakai bentuk literal (R2) - jangan `bg-white/10`.
5. Modal/toast pada halaman portal wajib di dalam `@section('overlays')`.
6. Bandingkan hasil dengan golden P02 (`docs/migration/baselines/<persona>/<halaman>/`) memakai
   `tools/imagediff.mjs` + `tools/diff-locate.mjs`, lalu catat setiap selisih yang disengaja di laporan P05.
