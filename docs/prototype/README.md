# Prototype portal penerbit

## Ruang lingkup Dimas

Tugas pada dokumen pembagian lama diterapkan ke katalog use case aktif terbaru berdasarkan fungsi, bukan nomor lama: P03 dashboard (UC29), P04 profil dan rekening (UC28), P05 daftar buku (UC31), P06 tambah/perbaiki buku (UC30), P07–P08 penjualan dan invoice (UC32–UC33), P09–P10 pencairan dan bukti transfer (UC34–UC35), serta P11 balasan ulasan (UC36).

Lampiran `IKAPI_F02_F06_Prototype_Full_Prompt_Revised.md` menyebut tugas F02/F06 milik Ghazy. Bagian prompt yang berlaku lintas fitur dipakai untuk isolasi route, pola mock, dan integrasi Laravel + Inertia. Fitur pembayaran dan profil pembeli tidak termasuk branch Dimas.

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

PDF buku divalidasi sebagai PDF hingga 50 MB sebelum metadata berkas disimpan. Isi PDF dan sampul tidak dikirim atau dipersistenkan. Batas format/ukuran sampul tidak ditetapkan, sehingga tidak ditambahkan validasi ukuran. Nominal pendapatan dan saldo pada fixture tidak menjadi rumus komisi atau kebijakan pencairan.

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

- `npm run check` — lulus setelah formatter dan lint memperbaiki/menemukan nol masalah pada 88 file.
- Type check terfokus pada page/support prototype — lulus.
- `npm run build` — lulus.
- `php artisan route:list --path=prototype` dengan `APP_ENV=local` — menampilkan 11 route prototype.
- `php -l routes/web.php` — lulus.
- Full `npm run types:check` masih gagal pada scaffold Wayfinder existing: API generated route tidak menyediakan `.form` yang dipakai sejumlah halaman auth/settings. Tidak ada error dari file prototype pada pemeriksaan terfokus.
- Pemeriksaan visual otomatis/browser tidak dijalankan; prompt lampiran melarang browser automation. Build dan route CLI tidak membuktikan aksesibilitas visual pada semua viewport.