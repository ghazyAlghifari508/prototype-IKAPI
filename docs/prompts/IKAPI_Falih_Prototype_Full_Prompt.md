# TASK: IKAPI Marketplace — Interactive Frontend Prototype (Falih Afnan Fauzi)
## Use Cases: UC-07, UC-09, UC-10, UC-18, UC-19, UC-20

---

## 1. Role & Objective

Act as a **Senior Frontend Engineer and UI/UX Engineer** responsible for implementing an interactive, code-first frontend prototype for the IKAPI Jawa Barat Online Bookstore.

The project already has an established technical stack and an initialized scaffold (Laravel 13, React 19, Inertia.js, TypeScript, Tailwind CSS v4, and shadcn/ui).

Your task is to implement the frontend prototype for exactly the 6 use cases assigned to **Falih Afnan Fauzi** as the primary PIC based on `Pemabgian Tugas IKAPI Jabar Berdasarkan UC.docx`:

- **UC-07 — Memberikan Komentar & Ulasan**
- **UC-09 — Menambahkan ke Keranjang (Shopping Cart)**
- **UC-10 — Mengelola Keranjang Belanja (Quantity, Remove, Calculation)**
- **UC-18 — Membaca E-Book (Buku Saya / Web Reader)**
- **UC-19 — Menambahkan Bookmark (Penanda Halaman)**
- **UC-20 — Memberikan Ulasan & Evaluasi Buku (Rating & Kuesioner Evaluasi)**

This is a **frontend prototyping task**, not a full-stack production backend implementation.

The final result must consist of actual React/TypeScript source files integrated into the existing Laravel + Inertia application, with interactive pages accessible through a local development browser under the `/prototype` prefix.

**Mandatory isolation rule:** All prototype URLs MUST use the `/prototype` prefix, all Inertia prototype page files MUST live inside dedicated subfolders in `resources/js/pages/prototype/`, and all prototype-specific components, hooks, state, types, utilities, and mock data MUST live inside `resources/js/prototype/`. Existing scaffold pages and production routes must remain intact.

Use mock data and simulated interactions to demonstrate the intended user experience with high polish.

---

## 2. Mandatory Repository & Specification Review

Before writing any implementation code, inspect the existing repository and review all relevant project documentation.

### Required documents (MUST NOT BE REMOVED OR CHANGED)

Read and understand:

1. `BPMN AS IS.drawio`
2. `bpmn_tobe_fixed2.drawio.png`
3. `ERD.drawio`
4. `Proposal_Abdimas_Online_Bookstore_IKAPI_Jabar_REVISI_FORMAT_ASLI (2).pdf`
5. `SCENARIO USE CASE_TERBARU.docx` (specifically Use Case 7, 9, 10, 18, 19, and 20)
6. `SKEMA RELASI.drawio`
7. `USE CASE.drawio`
8. `TECH_STACK_IKAPI_MARKETPLACE.md`
9. `Pembagian_Tugas_Per_Fitur_IKAPI_Jabar(1).pdf` and `Pemabgian Tugas IKAPI Jabar Berdasarkan UC.docx`

### Mandatory Design System Guidelines (`DESIGN.md` & `docs/design/`)

To ensure visual consistency across the entire application and harmony with other team members' prototypes (Fadli's auth, Dimas's publisher portal, and Ghazy's payments):

- **Read and adhere strictly to `DESIGN.md`:**
  - **Theme Aesthetic:** Notion-inspired *"warm paper notebook under afternoon sun"* (warm off-white canvas `#f6f5f4`, clean cards on `#ffffff` with 1px hairline borders and `12px` rounded corners, zero heavy drop-shadows).
  - **Color Palette Tokens:**
    - Primary CTA / Accent: Notion Blue `#0075de` (`--color-notion-blue`)
    - Canvas Background: Paper Warmth `#f6f5f4` (`--color-paper-warmth`)
    - Surface / Cards: Pure White `#ffffff` (`--color-pure-white`)
    - Text Primary: Ink Black `#000000` / Charcoal `#111111`
    - Text Muted: Stone `#757575` / Slate `#696969`
    - Soft Accents: Sky Tint `#e6f3fe`, Marigold `#ffb110` (ratings/stars), Coral `#f64932`
  - **Typography:** Instrument Sans / Inter with tight editorial hierarchy, clear line heights, and clean badges/pills (`border-radius: 9999px`).
  - **Buttons:** 8px rounded corners (`rounded-lg`), bold tactile interaction states.
  - **Existing Assets:** Reuse mock covers (`B01.jpg` – `B07.jpg`) and metadata in `docs/design/assets/assets.json`.

---

## 3. Existing Scaffold — Preserve and Reuse

The repository has already undergone scaffolding.

Inspect the current implementation before making changes:

- Laravel 13
- React 19
- TypeScript
- Inertia.js 3
- Tailwind CSS 4
- Radix UI & shadcn/ui components
- Vite (`vite-plus`)
- Existing route architecture in `routes/web.php`
- Existing prototype directory layout in `resources/js/prototype/` and `resources/js/pages/prototype/`

### Non-destructive implementation rules:

- Reuse the existing scaffold and standard components (`Button`, `Card`, `Dialog`, `Input`, `Badge`, etc.).
- Follow established project conventions.
- Preserve existing configuration and dependency lockfiles (`composer.lock`, `package-lock.json`).
- Avoid reinstalling or modifying core framework packages.
- Avoid modifying other members' existing prototype screens (e.g., `resources/js/prototype/publisher/` or `resources/js/prototype/F01Prototype.tsx`).
- Keep all new routes and logic strictly within the prototype sandbox.

---

## 4. Scope & Feature Ownership (Falih Afnan Fauzi)

Implement exactly the 6 use cases assigned to Falih Afnan Fauzi:

| Use Case | Title | Role / Actor | Core Responsibility |
| -------- | ----- | ------------ | ------------------- |
| **UC-07** | Memberikan Komentar & Ulasan | User / Pelanggan | Form komentar buku, validasi kata kasar (smart filter), feedback instan, daftar komentar |
| **UC-09** | Menambahkan ke Keranjang | User / Pelanggan | Tombol tambah keranjang, badge counter keranjang di navbar, notifikasi item ditambahkan |
| **UC-10** | Mengelola Keranjang Belanja | User / Pelanggan | Tampilan keranjang, ubah kuantitas, hapus item, ringkasan subtotal/pajak/total, tombol checkout |
| **UC-18** | Membaca E-Book (Buku Saya) | User / Pelanggan | Web reader buku digital, auto-resume posisi halaman terakhir dibaca, navigasi halaman, mode baca |
| **UC-19** | Menambahkan Bookmark | User / Pelanggan | Tombol penanda halaman aktif, daftar bookmark tersimpan, deteksi halaman yang sudah ditandai |
| **UC-20** | Memberikan Ulasan & Evaluasi Buku | User / Pelanggan | Kuesioner evaluasi mutu penerbit 4 aspek (skala 1-5), ulasan teks, kalkulasi rating, validasi kelengkapan |

### Relationship with other team members' features:
- **F01 (Fadli - Auth):** Use mock logged-in buyer user (`Falih Afnan Fauzi - pembeli@ikapi.id`).
- **F05 / F06 (Dimas & Ghazy - Checkout / Payment):** Cart checkout button navigates or links gracefully to the payment flow or displays a simulation modal.
- **F09 (Devina - Perpustakaan):** The E-Reader can be launched directly from mock purchased books in the user's library.

---

## 5. Detailed Specifications & Implementation Requirements

### PART A: SHOPPING CART (UC-09 & UC-10)

#### 5.1 UC-09 — Menambahkan ke Keranjang
- **Interactions:**
  1. Pengguna berada di halaman katalog atau detail buku dan menekan tombol *"Tambah ke Keranjang"*.
  2. Sistem memperbarui data keranjang secara reaktif.
  3. Badge counter keranjang pada header/navbar bertambah secara instan.
  4. Muncul notifikasi toast / alert: *"Buku berhasil ditambahkan ke keranjang"*.
  5. Pengguna memiliki opsi *"Lanjut Belanja"* atau *"Lihat Keranjang"*.

#### 5.2 UC-10 — Mengelola Keranjang Belanja
- **URL Route:** `/prototype/keranjang` (Inertia page: `resources/js/pages/prototype/cart/index.tsx`)
- **Interactions & Elements:**
  1. **Daftar Item:** Menampilkan cover buku, judul, penulis, penerbit, harga satuan, dan kuantitas.
  2. **Kontrol Kuantitas & Hapus:**
     - Tombol `+` dan `-` untuk menyesuaikan kuantitas (atau toggle lisensi digital).
     - Tombol hapus (*Remove item*) dengan konfirmasi cepat.
  3. **Perhitungan Otomatis:**
     - Subtotal per item.
     - Ringkasan total belanja (Subtotal, Diskon/Promo jika ada, Pajak/Biaya Layanan, Total Akhir).
  4. **State Keranjang Kosong (Empty State):**
     - Jika keranjang kosong, tampilkan ilustrasi hangat bertema buku, pesan informatif *"Keranjang Anda masih kosong"*, dan tombol CTA *"Jelajahi Katalog Buku"*.
  5. **Checkout CTA:** Tombol *"Lanjut ke Pembayaran"* / *"Checkout Sekarang"* yang memvalidasi isi keranjang.

---

### PART B: E-READER & BOOKMARKS (UC-18 & UC-19)

#### 5.3 UC-18 — Membaca E-Book (Buku Saya / Web Reader)
- **URL Route:** `/prototype/reader/{bookId?}` (Inertia page: `resources/js/pages/prototype/reader/index.tsx`)
- **Interactions & Elements:**
  1. **Tampilan Web Reader Modern:**
     - Header minimalis: Judul buku, nama penulis, indikator progres membaca (`Halaman X dari Y`, persen progres).
     - Area baca kanvas bersih dengan tipografi nyaman (serif/sans toggle, ukuran font A-/A+, pilihan tema: *Light Warm Paper*, *Sepia*, *Dark Mode*).
  2. **Navigasi Halaman:**
     - Tombol Next / Previous (panah keyboard / klik tombol / swipe).
     - Slider progres cepat halaman di bagian bawah.
  3. **Auto-Resume Posisi Terakhir:**
     - Sistem secara otomatis mencatat dan menyimpan halaman terakhir yang dibaca ke mock state/localStorage.
     - Saat buku dibuka kembali, tampil notifikasi: *"Melanjutkan dari halaman terakhir dibaca (Hal. X)"*.
  4. **Proteksi Naskah Terintegrasi:**
     - Menonaktifkan klik kanan (*context menu*), seleksi teks berlebih, dan tanpa tombol download berkas master PDF.

#### 5.4 UC-19 — Menambahkan & Mengelola Bookmark
- **Interactions & Elements:**
  1. **Tombol Bookmark:** Ikon bookmark di header reader yang menandai halaman yang sedang aktif dibaca.
  2. **Deteksi Duplikasi (Alternative Flow 2.a):**
     - Jika halaman aktif sudah di-bookmark, tampilkan notifikasi informatif: *"Halaman ini sudah ditandai sebelumnya"* dan opsi hapus bookmark.
     - Jika belum, simpan bookmark dan tampilkan toast: *"Bookmark berhasil ditambahkan pada Halaman X"*.
  3. **Drawer / Popover Daftar Bookmark:**
     - Pengguna dapat membuka daftar seluruh bookmark yang pernah disimpan untuk buku tersebut (nomor halaman, kutipan baris pertama, timestamp).
     - Klik bookmark langsung melompat (*jump*) ke halaman bersangkutan.

---

### PART C: COMMENTS, RATINGS & PUBLISHER EVALUATION (UC-07 & UC-20)

#### 5.5 UC-07 — Memberikan Komentar & Ulasan Buku
- **Interactions & Elements:**
  1. **Form Komentar Real-Time:**
     - Kolom input tanggapan/komentar pembeli.
     - Tombol *"Kirim Komentar"* hanya aktif jika kolom terisi teks valid (bukan hanya spasi atau simbol kosong).
  2. **Smart Content Filter (Alternative Scenario 4.a):**
     - Fitur pendeteksi kata-kata kasar / ujaran tidak pantas / spam.
     - Jika terdeteksi kata bermasalah (misal: kata kasar yang disimulasikan), sistem menolak pengiriman dan menampilkan notifikasi: *"Komentar mengandung kata yang tidak pantas, mohon perbaiki ulasan Anda"*, dengan highlight pada input agar pengguna dapat mengoreksinya.
  3. **Daftar Komentar Komunitas:**
     - Menampilkan komentar yang berhasil lolos validasi dengan avatar, nama pembeli, tanggal ulasan, dan isi komentar.
     - Menampilkan indikator verifikasi pembeli resmi.

#### 5.6 UC-20 — Memberikan Ulasan & Evaluasi Buku (Kuesioner Mutu Penerbit)
- **Interactions & Elements:**
  1. **Rating Bintang Global:** 1 sampai 5 bintang untuk kepuasan buku.
  2. **Kuesioner Evaluasi Berstruktur 4 Aspek (Skala Likert 1-5):**
     Sesuai dokumen skenario spesifikasi asli:
     - (a) Kesesuaian ekspektasi
     - (b) Kebermanfaatan isi naskah
     - (c) Kesesuaian harga buku
     - (d) Peluang membeli lagi di penerbit ini
  3. **Testimoni Teks Ulasan:** Kolom pengalaman membaca mendalam.
  4. **Validasi Kelengkapan (Alternative Scenario 2.a):**
     - Jika pengguna menekan tombol *"Kirim Evaluasi & Ulasan"* tanpa melengkapi seluruh poin kuesioner, tampilkan peringatan: *"Silakan lengkapi seluruh poin kuesioner evaluasi sebelum mengirim"*.
  5. **Feedback Sukses:**
     - Modal/Toast: *"Evaluasi Berhasil Dikirim. Terima kasih atas partisipasi Anda membangun kualitas literasi Jawa Barat!"*.
     - Akumulasi rating dan evaluasi langsung ter-update di tampilan lokal.

---

## 6. Directory Layout & Subfolder Isolation Rules

All code must strictly reside in subfolders matching the prototype convention:

```text
resources/js/
├── pages/
│   └── prototype/
│       ├── cart/
│       │   └── index.tsx              # URL: /prototype/keranjang
│       ├── reader/
│       │   └── index.tsx              # URL: /prototype/reader (atau /baca/{id})
│       └── reviews/
│           └── index.tsx              # URL: /prototype/ulasan-evaluasi
├── prototype/
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItemList.tsx
│   │   ├── CartSummary.tsx
│   │   └── cartStore.ts               # Local reactive store (Zustand/Custom Hook)
│   ├── reader/
│   │   ├── ReaderCanvas.tsx
│   │   ├── ReaderControls.tsx
│   │   ├── BookmarkDrawer.tsx
│   │   ├── readerStore.ts
│   │   └── sampleBookContent.ts       # Mock pages & chapters content
│   ├── reviews/
│   │   ├── CommentList.tsx
│   │   ├── CommentForm.tsx
│   │   ├── EvaluationModal.tsx
│   │   ├── smartFilter.ts             # Bad words / spam detector
│   │   └── reviewsStore.ts
│   └── mocks/
│       └── mockCatalog.ts             # Reusable book mock data matching B01-B07
routes/
└── web.php                            # Isolated /prototype routes
```

---

## 7. Routes to Register in `routes/web.php`

Inside the `app()->environment('local')` prototype group in `routes/web.php`:

```php
Route::prefix('prototype')->name('prototype.')->group(function () {
    // Falih Afnan Fauzi Modules (UC-07, 09, 10, 18, 19, 20)
    Route::inertia('keranjang', 'prototype/cart/index')->name('cart.index');
    Route::inertia('reader/{bookId?}', 'prototype/reader/index')->name('reader.index');
    Route::inertia('ulasan', 'prototype/reviews/index')->name('reviews.index');
});
```

---

## 8. Verification & Acceptance Criteria

1. **Routing Check:** Mengakses `/prototype/keranjang`, `/prototype/reader`, dan `/prototype/ulasan` menghasilkan HTTP 200 tanpa error terminal.
2. **Design Fidelity:** Menggunakan token warna Notion Warmth `#f6f5f4`, Notion Blue `#0075de`, border radius `12px`, dan tipografi clean sesuai `DESIGN.md`.
3. **Cart Interactivity:** Tambah buku, ubah kuantitas, hapus buku, dan perhitungan subtotal/total berfungsi responsif secara lokal.
4. **Reader Experience:** Halaman e-reader dapat dibolak-balik, ukuran font/tema dapat diganti, bookmark tersimpan dan mendeteksi duplikat, serta posisi halaman terakhir otomatis tersimpan (*auto-resume*).
5. **Review & Evaluation:** Filter kata kasar pada form komentar bekerja dengan baik, dan kuesioner evaluasi 4 skala likert memvalidasi kelengkapan sebelum terkirim.
6. **Code Quality:** `npm run build` dan `php artisan test` tetap lulus 100% tanpa regresi.

---

## 9. Addendum: Catatan Rapat Revisi 22 Oktober 2026 (Domain Pembeli)

Berdasarkan arahan rapat koordinasi 22 Oktober 2026, ditambahkan fitur-fitur spesifik untuk pembeli (Falih Afnan Fauzi):

1. **Ulasan Pembeli Terverifikasi (Wajib Lunas):**
   - *"Ulasan (yang penting udah bayar udah boleh ngulas), create dan read ulasan"*.
   - Pembeli hanya diizinkan mempublikasikan ulasan dan evaluasi jika status transaksi buku tersebut telah dibayar/lunas.
   - Dilengkapi switch simulasi status pembayaran pada demo untuk memudahkan pengujian live kedua skenario (lunas vs belum lunas).
2. **Ikon Love (Favoritkan Buku):**
   - Terdapat ikon hati di setiap sampul buku untuk menandai buku favorit ke dalam daftar *Favorit Saya*.
   - Filter cepat kategori *❤️ Favorit Saya* di katalog.
3. **Status 'Sudah Dibaca' di Perpustakaan / E-Reader:**
   - Pembaca dapat menandai status buku sebagai *Sudah Dibaca 🎓* dengan lencana visual pada kartu katalog dan tombol centang pada E-Reader.
4. **Streak Membaca Harian (Reading Streak):**
   - Indikator streak membaca harian pembeli (misal: 4 hari berturut-turut) beserta pencapaian target waktu membaca harian.
5. **Dark Mode & Light Mode pada E-Reader:**
   - Tombol cepat 1-klik untuk beralih antara Mode Gelap (Dark Mode) dan Mode Terang (Warm Paper) di bilah navigasi reader.

