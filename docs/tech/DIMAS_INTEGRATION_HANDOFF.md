# Handoff modul Dimas

Branch ini mengerjakan bagian penerbit yang dapat dibuktikan pada struktur
Laravel terbaru:

- UC-30: profil instansi dan satu rekening payout milik penerbit.
- UC-31: dashboard penerbit dengan jumlah buku aktif dari database. Metrik
  transaksi, pendapatan, saldo, dan rating tetap menampilkan keadaan belum
  tersedia sampai model transaksi/ledger/review kanonis tersedia.
- UC-32: CRUD metadata buku, penulis, kategori, harga, diskon, sampul, dan PDF
  privat. Status `draft` dan `published` mengikuti pilihan penerbit.

## Integrasi yang masih menunggu PIC lain

### UC-35 — invoice penjualan penerbit

Prompt UC-35 bergantung pada UC-34 Aprila serta model `Order`, `OrderItem`, dan
status pembayaran terverifikasi dari Ghazy. Branch dasar terbaru belum memiliki
ketiga kontrak tersebut dan belum memiliki renderer PDF invoice yang dapat
digunakan kembali. Karena itu branch ini tidak membuat tabel pesanan atau invoice
kedua, dan tidak mengarang nilai komisi/net revenue.

Kontrak integrasi yang dibutuhkan:

```text
GET /publisher/orders/{order}/invoice
publisher approved + active
payment status = settled
query item hanya untuk publisher_registration_id milik session
response: application/pdf, filename aman, storage privat bila dicache
```

### UC-38 — balasan ulasan penerbit

Prompt UC-38 bergantung pada model review/comment kanonis milik Falih serta
aturan moderasi Lydia. Branch dasar terbaru belum memiliki model review atau
route review. Branch ini tidak membuat tabel komentar kedua dan tidak mengklaim
balasan end-to-end sebelum kontrak tersebut tersedia.

Kontrak integrasi yang dibutuhkan:

```text
review -> book -> publisher_registration
POST /publisher/reviews/{review}/reply
author berasal dari user session, bukan payload
teks wajib, plain text, escaped saat ditampilkan
balasan diberi label Balasan Penerbit
```

Setelah model kanonis tersedia, endpoint dan UI dapat ditambahkan tanpa
mengubah identitas penerbit atau sumber data katalog pada branch ini.
