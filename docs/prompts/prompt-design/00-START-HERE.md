# IKAPI Store — Prompt Lengkap Semua Halaman PEMBELI

## Cara pakai
1. Gunakan **satu file `.md` per giliran agent**, sesuai urutan nomor file (01–19). Setiap file **standalone** dan mengandung kontrak sumber/riset/aset, visualisasi desktop/mobile, semua state dan acceptance criteria.
2. Berikan agent akses ke repository `ghazyAlghifari508/prototype-IKAPI`, branch `feature/breeze-auth-scaffold`, dan FigCraft MCP yang benar-benar terhubung.
3. Fokus pada **prototype UI/UX**; **tidak** mengubah Laravel backend/database, commit/push/merge, tidak browser QA. Boleh gunakan browser/Chrome DevTools untuk riset referensi visual eksternal.
4. Jika agent tidak berhasil membaca gambar/asset/reference, jangan menyatakan telah membaca. Tugasnya melaporkan blocker, mencari alternatif legal, dan melanjutkan hal aman.
5. Prioritas: keputusan produk terbaru → skenario use case dan BPMN TO-BE → referensi bookstore IKAPI → visual assets. Root `DESIGN.md` Notion bukan visual source utama, `scrape-ref` Midtrans hanya pembanding style terbatas.
6. Buku milik pembeli dibaca di browser, tidak bisa diunduh. Data katalog hanya demo. Event dan komunitas tetap. Halaman user saja, tanpa pengembangan portal peran lain.

## Ketidakpastian material yang perlu ditandai (jangan tebak)
- Keranjang untuk hak baca e-book: skenario mengizinkan mengubah kuantitas, tetapi tidak jelas apakah dua lisensi judul yang sama dapat dibeli akun sama.
- Komunitas: fitur ada, tetapi struktur forum, posting, join, interaksi anggota dan moderasi belum dirinci setara use case checkout.
- Payment methods aktif/expiry nominal/biaya layanan/pembatalan-retry harus mengikuti konfigurasi dan keputusan produk, bukan dikarang dari contoh docs.
- Event dan katalog adalah fixture simulasi; jangan membuat klaim jadwal resmi, penjualan dan rating sungguhan.

## Isi
- [01. Login Pembeli](01-login.md) — UC-02 Login; relasi UC-01 registrasi dan UC-03 profil
- [02. Registrasi Akun Pembeli](02-registrasi.md) — UC-01 Registrasi, UC-02 Login
- [03. Lupa Kata Sandi, Reset, dan Konfirmasi Email](03-recovery-verifikasi.md) — Kelanjutan UC-01/02; routes/auth.php Breeze: forgot-password/reset-password/verify-email/confirm-password
- [04. Profil dan Keamanan Akun](04-profil-akun.md) — UC-03 Mengelola Profil; profil auth Laravel
- [05. Katalog Buku, Kategori, dan Filter](05-katalog.md) — UC-04 Melihat Katalog; UC-21 Filter Kategori; dependensi UC-05 Search
- [06. Pencarian Buku dan Hasil Pencarian](06-pencarian.md) — UC-05 Mencari Buku; UC-21 kategori; UC-04 katalog
- [07. Halaman Detail Buku](07-detail-buku.md) — UC-06 Detail; UC-07 komentar; UC-08 preview; UC-09 keranjang; UC-20 evaluasi
- [08. Preview Sampel Buku Sebelum Membeli](08-preview-buku.md) — UC-08 Preview Buku; UC-06 Detail; terkait UC-18 tetapi hak berbeda
- [09. Keranjang E-Book dan Pengelolaan Item](09-keranjang.md) — UC-09 Tambah Keranjang; UC-10 Kelola Keranjang; UC-11 membuat order
- [10. Checkout dan Konfirmasi Order](10-checkout.md) — UC-11 Membuat Order; UC-14 Total dan batas waktu; bergantung UC-10 Cart
- [11. Pemilihan Metode Pembayaran, Midtrans, dan Semua Status Transaksi](11-pembayaran-midtrans.md) — UC-12 Pilih Metode; UC-13 Proses Midtrans; UC-14 total/batas waktu; UC-15 status bayar; UC-16 status pesanan
- [12. Riwayat Pesanan, Detail, Status, dan Invoice PDF](12-riwayat-pesanan-invoice.md) — UC-15 Payment Status; UC-16 Order Status; UC-17 Riwayat; UC-22 Download Invoice
- [13. Perpustakaan Pribadi, Empat Tab, Wishlist, dan Pencarian Koleksi](13-perpustakaan-saya.md) — UC-23 Perpustakaan (4 tab); UC-24 Cari Buku; UC-18 Baca; UC-19 Bookmark
- [14. Web Reader, Auto-Resume, Navigasi, dan Bookmark](14-web-reader-bookmark.md) — UC-18 Membaca E-Book; UC-19 Menambah Bookmark; UC-08 Preview sebagai jalur terpisah
- [15. Komentar Buku dan Evaluasi Setelah Pembelian](15-komentar-evaluasi.md) — UC-07 komentar dengan filter validasi; UC-20 evaluasi 4 indikator skala 1–5 setelah beli
- [16. Agenda Event, Kalender, Berita Literasi, dan Detail](16-agenda-berita.md) — UC-25 event & news: kalender + list + detail, confirmed event real feature
- [17. Halaman Komunitas Pembaca yang Sesuai Scope](17-komunitas.md) — Use case diagram: akses forum/komunitas; ERD: komunitas dan anggota; detail skenario belum setara UC-01..27
- [18. Chatbot Bantuan dan Rekomendasi Buku](18-chatbot-bantuan.md) — UC-26 Chatbot bantuan/rekomendasi, link ke detail buku, out-of-scope fallback
- [19. Komponen Riwayat Buku Terakhir Dilihat](19-terakhir-dilihat.md) — UC-27 Recently Viewed, sebagai komponen konteks katalog/beranda bukan halaman besar baru
