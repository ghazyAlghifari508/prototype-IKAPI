# Prototype portal penerbit

## Ruang lingkup Dimas

Tugas pada dokumen pembagian lama diterapkan ke katalog use case aktif terbaru berdasarkan fungsi, bukan nomor lama: P03 dashboard (UC29), P04 profil dan rekening (UC28), P05 daftar buku (UC31), P06 tambah/perbaiki buku (UC30), P07–P08 penjualan dan invoice (UC32–UC33), P09–P10 pencairan dan bukti transfer (UC34–UC35), serta P11 balasan ulasan (UC36).

Lampiran `IKAPI_F02_F06_Prototype_Full_Prompt_Revised.md` menyebut tugas F02/F06 milik Ghazy. Bagian prompt yang berlaku lintas fitur dipakai untuk isolasi route, pola mock, dan integrasi Laravel + Inertia. Fitur pembayaran dan profil pembeli tidak termasuk branch Dimas.

### Revisi catatan 22 Oktober 2026

- Form buku menghitung karakter judul dan sinopsis tanpa menetapkan batas. Judul disimpan sesuai kapitalisasi yang diketik; tidak ada aturan judul harus huruf besar semua.
- Penulis dipilih dari daftar lokal yang diisi dari data buku, dengan aksi untuk menambahkan nama. Ini simulasi daftar database; belum ada tabel/API penulis.
- Penerbit tampil mengikuti profil penerbit yang sedang masuk. Form buku tidak dapat membuat atau memilih pemilik penerbit lain; perubahan nama dilakukan melalui profil penerbit.
- Kategori memakai daftar aktif V6: Pendidikan, Teknologi, Bisnis, Sastra, Budaya. Daftar genre belum menjadi taxonomy, sehingga genre opsional berupa teks bebas.
- Edisi opsional. Nama dan kutipan tokoh/media juga opsional dan dipasangkan bila salah satunya diisi.
- PDF e-book penuh tetap wajib dan maksimal 50 MB sesuai UC30. Berkas sampel/bab PDF terpisah bersifat opsional untuk preview; tidak ditambah batas ukuran yang belum ditetapkan.
- Daftar buku menyediakan filter kategori dan rentang tanggal perubahan. Konteks filter dipulihkan saat kembali dari detail buku.
- Detail buku aktif menampilkan rating dan ulasan pembeli untuk buku tersebut serta tautan ke P11. Invoice PDF pada P07/P08 sudah tersedia. Pengajuan pencairan menggunakan istilah pencairan, rekening terdaftar, nominal positif yang tidak melebihi saldo tersedia, reservasi ke status Dalam Proses, dan pemrosesan manual; minimum pencairan/biaya/SLA tidak ditambahkan.
- Favorit, invoice pembeli, reader, bookmark, tema perpustakaan, dan streak adalah bagian pembeli dan tidak termasuk tugas Dimas.

Rujukan IKAPI yang ditemukan: [Permendikbudristek No. 22 Tahun 2022](https://www.ikapi.org/wp-content/uploads/2024/05/Salinan-permendikbudristek-nomor-22-tahun-2022_240530_151803.pdf) membahas kelengkapan judul dan edisi serta mengakui testimoni sebagai kata pengantar; aturan batas karakter judul/sinopsis dan kapitalisasi khusus tidak ditemukan pada ketentuan yang diperiksa. Karena itu penghitung hanya informatif. Contoh data edisi juga muncul pada [Katalog Bersama IKAPI](https://www.katalog-bersama.ikapi.org/produk_detail.php?id=125).

## Route dan isolasi

Seluruh route prototype berada di bawah `/prototype` dan didaftarkan hanya bila `APP_ENV=local`. Entry Inertia berada di `resources/js/pages/prototype/publisher/`; UI, komponen, CSS, tipe, fixture, state, serta utilitas berada di `resources/js/prototype/publisher/`. Tidak ada tautan prototype di navigasi scaffold produksi.

| Halaman | Route |
| --- | --- |
| Awal | `/prototype` |
| Ringkasan | `/prototype/penerbit/dashboard` |
| Profil & rekening | `/prototype/penerbit/profil` |
| Daftar buku | `/prototype/penerbit/buku` |
| Tambah buku | `/prototype/penerbit/buku/baru` |
| Perbaiki/detail buku | `/prototype/penerbit/buku/{id}/edit` |
| Pesanan masuk | `/prototype/penerbit/pesanan` |
| Detail penjualan | `/prototype/penerbit/pesanan/{id}` |
| Pencairan | `/prototype/penerbit/pencairan` |
| Detail pencairan | `/prototype/penerbit/pencairan/{id}` |
| Ulasan | `/prototype/penerbit/ulasan` |

## State dan batas simulasi

Data penerbit, rekening, buku, penjualan, pencairan, rating, dan balasan adalah fixture fiktif di `publisher/store.ts`. Perubahan disimpan ke localStorage dengan key `ikapi.publisher.prototype.v1`; menu akun menyediakan **Pulihkan data awal**. Invoice dibuat sebagai PDF lokal di browser. Tidak ada database bisnis, upload berkas ke server, otorisasi produksi, email, Midtrans, perhitungan komisi, atau transfer dana.

PDF buku divalidasi sebagai PDF hingga 50 MB sebelum metadata berkas disimpan. PDF sampel/bab opsional hanya memeriksa format PDF. Isi PDF dan sampul tidak dikirim atau dipersistenkan. Batas format/ukuran sampul tidak ditetapkan, sehingga tidak ditambahkan validasi ukuran. Nominal pendapatan dan saldo pada fixture tidak menjadi rumus komisi atau kebijakan pencairan.

Pengajuan buku baru/perbaikan berstatus **Menunggu Approval**. Buku aktif hanya bisa dilihat karena aturan perubahan buku aktif belum diputuskan. Permintaan pencairan mock memindahkan saldo tersedia ke saldo dalam proses; pemrosesan admin/transfer manual berada di luar branch ini. Fixture tidak menyertakan bukti transfer selesai, jadi viewer hanya aktif bila data kelak menyediakan bukti aktual. Data order membatasi identitas pembeli ke label nama singkat.

Balasan yang disimpan ditandai **Balasan penerbit**. UI tidak mengklaim akun sudah terverifikasi, jadi badge resmi tidak ditampilkan.

## Arah visual

UI ini memakai `DESIGN.md` IKAPI pada workspace: ivory `#F3F0E6`, surface `#FFFCF6`, ink `#24262F`, marun `#A33B46`, coral lembut `#E66B73`, Lora untuk judul, dan Nunito Sans untuk teks operasional. `DESIGN.md` yang saat ini tersimpan di branch `main` GitHub masih berisi referensi visual Notion dan bertentangan dengan arah IKAPI workspace. File desain bersama itu tidak ditimpa pada branch Dimas; pemilik proyek perlu menyatukan sumber desain sebelum merge bila arah IKAPI akan menjadi standar repo.

## Menjalankan lokal

1. Pasang dependency dari lockfile: `composer install` dan `npm ci`.
2. Buat konfigurasi lokal dari `.env.example`, atur `APP_ENV=local`, lalu `php artisan key:generate`.
3. Jalankan `npm run dev` dan `php artisan serve`.
4. Buka `/prototype`.

Prototype tidak menyimpan transaksi ke PostgreSQL. Untuk sesi lokal tanpa database, set `SESSION_DRIVER=file`, `CACHE_STORE=file`, dan `QUEUE_CONNECTION=sync` pada `.env`.

## Verifikasi saat implementasi

- `npm run check` — lulus; formatter memeriksa 96 file dan lint menemukan nol masalah pada 88 file.
- `npm run types:check` — lulus penuh.
- `npm run build` — lulus. Build memberi catatan bahwa optimasi fallback font opsional membutuhkan paket `fontaine`; ini tidak menggagalkan build.
- `php artisan route:list --path=prototype` dengan `APP_ENV=local` — menampilkan 11 route prototype.
- `php -l routes/web.php` — lulus.
- Route prototype tetap bersifat lokal; saat `APP_ENV=production`, daftar route prototype kosong.
- Pemeriksaan visual otomatis/browser tidak dijalankan; prompt lampiran melarang browser automation. Build dan route CLI tidak membuktikan aksesibilitas visual pada semua viewport.
