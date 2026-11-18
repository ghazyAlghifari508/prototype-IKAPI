# HANDOFF DOKUMENTASI PROYEK IKAPI STORE (PROTOTYPE DESIGN)

Dokumen ini dibuat sebagai rangkuman lengkap konteks, riwayat perbaikan, arsitektur folder, aset, integrasi MCP, dan aturan desain untuk digunakan pada sesi AI berikutnya.

---

## 1. Identitas & Lingkungan Kerja
- **Repositori:** `prototype-IKAPI`
- **Branch Aktif:** `prototype-only`
- **Stack Teknologi:** HTML5, Tailwind CSS (via CDN), Vanilla JavaScript, Playwright (untuk automated QA).
- **Direktori Utama Prototype:** `docs/design/prototype-copy/`
- **Direktori Aset Desain:** `docs/design/assets/`

---

## 2. Struktur Direktori Prototype
Saat ini seluruh halaman prototype telah dikelompokkan ke dalam 3 subfolder peran:

```text
docs/design/prototype-copy/
├── user/       (32 file HTML - Publik & Pembeli / E-Commerce)
├── penerbit/   (17 file HTML - Portal Penerbit / Mitra Anggota)
└── admin/      (14 file HTML - Portal Administrator / DPD IKAPI)
```

> **Aturan Penting Referensi Aset:**  
> Karena semua file HTML berada di dalam subfolder (`user/`, `penerbit/`, atau `admin/`), path relatif menuju aset gambar/ilustrasi wajib menggunakan:  
> `../../assets/...` (bukan `../assets/`).

---

## 3. Integrasi MCP Google Stitch
Untuk mengakses proyek Google Stitch pengguna:
- **Server MCP:** `https://stitch.googleapis.com/mcp`
- **Header:** `X-Goog-Api-Key: [REDACTED_STITCH_API_KEY]`
- **Project Target:** `Duplicate of IKAPI Store E-Commerce Website` (ID: `11157457092651021307`)
- **Prosedur Fetching:**
  1. Panggil JSON-RPC MCP method `tools/call` dengan nama `list_screens` (`projectId: "11157457092651021307"`).
  2. Dapatkan detail screen via `get_screen` untuk mengambil `htmlCode.downloadUrl`.
  3. Download via HTTP GET dengan header `X-Goog-Api-Key`.
  4. Response berupa JSON `{ "dataString": "<!DOCTYPE html>..." }` yang perlu diekstrak string HTML-nya.

---

## 4. Rangkuman Pengerjaan Per Prompt (P1 - P12)

### A. Halaman Beranda (`user/beranda_desktop.html`)
- Mengganti hero ungu SaaS menjadi carousel 3 banner gambar utuh (`Dari Penerbit Jawa Barat.png`, `Screenshot 2026-11-15 005252.png`, `Screenshot 2026-11-15 005335.png`).
- 5 kategori berbasis ilustrasi asli transparan (`sastra.png`, `pendidikan.png`, `budaya.png`, `bisnis.png`, `anak-remaja.png`).
- Sampul buku nyata (B01 - B15) rasio 2:3, tanpa efek gradient CSS.
- Menambahkan section **Buku Rilis Terbaru** dan **Buku Terlaris**.
- Agenda Literasi horizontal scroll ala Gramedia Social Hub.
- Footer 4 kolom minimalis (Gramedia standard).

### B. Katalog Buku (`user/katalog_buku_desktop.html`)
- Membersihkan toolbar filter redundan (menghapus chip `Semua Kategori ×`, `E-Book Resmi ×`, tombol `Reset Filter` di toolbar).
- Menghapus section `recently-viewed-section` (Terakhir Dilihat) dari katalog publik.
- Navbar diselaraskan (menu Kategori dihapus dari header navigasi utama).
- Filter sidebar kategori, penerbit, dan harga tetap dipertahankan utuh.

### C. Detail Buku (`user/detail_buku_desktop.html`)
- Mengganti cover screenshot website dengan sampul nyata `laskar-aksara-pasundan.jpg` (2:3).
- Layout 2 kolom proporsional (5 cols gambar, 7 cols informasi).
- Menghapus copy teknis: *"Harga Lisensi Baca"*, *" / akses permanen"*, *"Format e-book dibaca langsung..."*.
- Sinopsis dan Detail Buku bersih (menghapus hashtag, kutipan bab fiktif, ISBN tidak valid, dan kotak pastel per baris).
- Ulasan Pembaca natural (3 ulasan), tanpa badge *"Pembeli Sah"*.
- Buku Terkait menggunakan sampul bersih yang konsisten dengan katalog.
- Tombol *"Baca Cuplikan"* langsung membuka `preview_buku_desktop.html`.

### D. Preview Buku (`user/preview_buku_desktop.html`)
- Mengubah floating modal menjadi dedicated clean reader layout.
- Menghilangkan navbar e-commerce dari mode baca; header hanya memuat `← Kembali`, judul buku, dan kontrol.
- Font bacaan editorial `Literata` / `Georgia` rata kiri (`leading-[1.8]`, `18px`).
- Konten bab nyata 4 halaman (Hal 41–44) dengan pagination dan scrub bar yang sinkron.
- Kontrol pagination dan tombol bayar disatukan dalam satu baris kontrol horizontal yang rapi.

### E. Masuk Login (`user/masuk_login_desktop.html`)
- Panel kiri diubah menjadi illustration showcase minimalis menggunakan aset lokal `auth_login_welcome.svg` berlatar `bg-surface-soft`.
- Menghapus artwork 3D, copy marketing panjang, badge DRM, dan statistik `4.200+`, `180+`, `100%`.
- Formulir login kanan dipertahankan 100% fungsional (email, password toggle, validasi, Google SSO).

### F. Daftar Akun / Register (`user/daftar_akun_register_desktop.html`)
- Diselaraskan 100% dengan gaya halaman login (single container card, 5 cols kiri ilustrasi `auth_login_welcome.svg`, 7 cols kanan formulir).
- Copy disederhanakan: *"Buat Akun"*, *"Daftar"*, *"Sudah punya akun? Masuk"*.
- Seluruh input dan validasi dipertahankan (Nama, Email, No HP, Password, Confirm Password, Terms, Google SSO).

### G. Lupa Kata Sandi (`user/lupa_kata_sandi_desktop.html`)
- Editorial split layout (5 cols kiri `auth_login_welcome.svg`, 7 cols kanan form).
- Menghapus dotted radial pattern dan ikon gembok 3D kecil.
- Single back navigation di header: `← Kembali ke Masuk`.
- Copy bersih: *"Lupa Kata Sandi?"*, *"Kirim Tautan"*, *"Butuh bantuan?"*, feedback konfirmasi aman tanpa membuka data registrasi email.

### H. Verifikasi Email (`user/verifikasi_email_desktop.html`)
- Editorial split layout dengan ilustrasi khusus `auth_email_verification.svg` (tumpukan buku klasik, amplop surat, dan pembaca).
- Menghapus amplop outline pastel generik, klaim 24 jam, dan link Gmail hardcoded (`mail.google.com`).
- Menampilkan email dinamis (mendukung URL parameter `?email=...`).
- Tombol *"Kirim Ulang Email"* dengan loading state dan toast jujur; tautan *"Ganti Email"*.

### I. Keranjang & Pembayaran (`user/keranjang_pembayaran_terpadu_desktop.html`)
- Seluruh status pembayaran dan modal demo dikembalikan ke dalam satu file HTML terpadu (menghapus file terpisah).
- Modal konfirmasi pesanan (`#modal-order-confirm`) default tersembunyi, hanya terbuka saat klik *"Lanjut ke Pembayaran"*.
- Modal Snap (`#snap-overlay`) dengan baris pratinjau demo status: `✓ Berhasil`, `⏳ Menunggu`, `✕ Gagal`, `⏰ Kedaluwarsa`.
- Empty cart state menggunakan ilustrasi lokal `cart_empty_state.svg`.
- Kalkulasi harga dinamis saat item dihapus dari keranjang.

### J. Perpustakaan Saya (`user/perpustakaan_saya_desktop.html`)
- Section **Lanjutkan Membaca** menggunakan sampul asli `laskar-aksara-pasundan.jpg`, progress 23%, tanpa lingkaran dekoratif.
- Counter tab dinamis dihitung otomatis dari data: `Semua Buku (3)`, `Sedang Dibaca (1)`, `Belum Dibaca (2)`, `Buku Favorit (2)`.
- Fitur favorit toggle aktif dinamis.
- *"Tandai Selesai"* mengubah status buku menjadi `completed` dan menyembunyikan banner Lanjutkan Membaca.
- Sorting DOM fungsional (Judul A-Z, Kemajuan Baca, Terakhir Diakses).
- 3 Mode simulasi dipertahankan dalam satu HTML: `Simulasi Koleksi Kosong` (SVG `reading_book_casual.svg`), `Simulasi Hasil Nihil` (SVG `search_not_found.svg`), dan `Pulihkan Koleksi Asli`.

### K. Agenda & Berita Literasi (`user/agenda_berita_literasi_desktop.html`)
- Featured event menggunakan foto asli `event-book-fair.jpg` tanpa efek miring dan tanpa klaim *"120+ Naskah"*.
- Kalender dinamis: perhitungan tanggal riil, navigasi bulan/tahun, filter tanggal riil (klik 18 Nov hanya memunculkan event 18 Nov).
- Unduh file `.ics` iCalendar resmi berfungsi nyata saat klik *"Simpan ke Kalender"*.
- Berita artikel utama & 2 artikel sekunder dilengkapi thumbnail riil; section newsletter dihapus.
- Empty states menggunakan `community_reading.svg` dan `reading_ebook_reader.svg`.
- 4 Tombol simulasi tetap aktif dalam satu HTML.

### L. Akun Saya & Dropdown Navigasi (`user/akun_saya_profil_dropdown_navigasi_desktop.html`)
- Header user dropdown fungsional (`#toggle-dropdown-btn`, `aria-expanded`, klik luar & Escape untuk menutup).
- Sinkronisasi avatar & inisial nama secara instan di navbar, sidebar, dan formulir.
- Unggah foto profil mendukung JPG/PNG/WebP maks 2MB dengan pratinjau instan; tombol *"Hapus Foto"* kembali ke inisial.
- Field alamat fisik dihapus; kategori bacaan menggunakan chip interaktif.

### M. Web Reader (`user/web_reader_desktop.html`)
- Default theme adalah **Light (Putih Bersih)** dengan semantic design tokens (`[data-reader-theme]`). Opsi Sepia dan Dark tetap tersedia.
- Pagination riil multi-halaman Bab 3 (Halaman 41–44) dengan teks naskah berganti sinkron dengan progress bar.
- Bookmark engine fungsional: tombol `+ Tandai` mencatat halaman aktif, mencegah duplikasi, dan klik bookmark memindahkan halaman baca.
- Daftar Isi (TOC) menavigasikan halaman bab secara riil.
- Pengaturan font size (16px, 18px, 22px), line height (1.6, 1.8, 2.0), dan jenis huruf (Literata Serif vs Jakarta Sans).
- Fullscreen API fungsional.

### N. Portal Penerbit & Admin (`penerbit/` dan `admin/`)
- Sebanyak 31 file HTML di-download dari Stitch project `11157457092651021307`.
- Seluruh tag logo dialihkan ke logo lokal resmi `../../assets/logo-ikapi-jabar.png` (menghapus URL Google CDN yang menghasilkan redirect 302).
- Ilustrasi login admin diganti `../../assets/ilustration/auth_login_welcome.svg`.

---

## 5. Status Validasi & Pengujian
- **Uji Gambar (Playwright):** 63 file HTML diuji across `user`, `admin`, `penerbit` (total 218 gambar). **Hasil: 0 broken images** (`naturalWidth > 0`).
- **Uji Responsivitas & Overflow:** Lolos di 5 ukuran layar (1440px, 1280px, 768px, 390px, 320px) dengan **0px horizontal overflow**.
- **Uji Scrolling:** Aturan pengunci scroll (`overscroll-behavior: none` dan `::-webkit-scrollbar { display: none; }` global) telah dibersihkan. Seluruh halaman dapat di-scroll vertikal via mouse wheel, keyboard, dan touch.
- **Console Errors:** 0 error JavaScript.

---

## 6. Prinsip Desain yang Harus Dipertahankan Sesi Berikutnya
1. **No AI Slop:** Hindari floating circles, gradient blobs, badge bertumpuk, emoji berlebihan, bintang/sparkles, dan copy promosi teknis/cringe.
2. **Karakter Visual Kuat:** Bersih bukan berarti kosong/polos. Pertahankan aset foto nyata, ilustrasi lokal resmi IKAPI, dan tipografi Plus Jakarta Sans / Literata.
3. **Simulasi dalam 1 File:** Jika ada skenario demo/simulasi prototype, pertahankan di file HTML yang sama via tombol toolbar, jangan membuat file HTML baru.
4. **Alur & Copy Natural:** Gunakan bahasa Indonesia lugas khas toko buku/e-commerce, bukan bahasa teknis database/SaaS.
