# Product Requirements Document (PRD)
## IKAPI Store — Marketplace E-Book Jawa Barat
### Fokus: Pengalaman Pembeli dan Halaman Publik · Handoff ke Google Stitch

**Versi:** 1.0 — Draft desain berbasis sumber  
**Tanggal:** 14 November 2026  
**Pemilik keputusan produk:** Tim proyek IKAPI Jawa Barat  
**Tujuan dokumen:** Menjadi acuan produk untuk merancang prototipe UI/UX sisi pembeli. **Bukan** bukti bahwa seluruh fitur telah terimplementasi.  
**Status data:** Katalog dan harga yang tersedia saat ini adalah **data simulasi**.

> **Prinsip kerja:** Bangun pengalaman berbelanja dan membaca e-book yang mudah dipahami. Jangan mengubah seluruh fitur sistem menjadi section promosi homepage. Pisahkan kebutuhan bisnis, perilaku aplikasi, dan pilihan visual. Jika sumber belum menetapkan sebuah keputusan produk, tandai sebagai keputusan terbuka; jangan membuat fakta baru.

---

# 1. Ringkasan produk

IKAPI Store adalah rancangan marketplace berbasis web yang mempertemukan pembeli dengan buku digital dari ekosistem penerbit anggota IKAPI Jawa Barat. Pembeli dapat menjelajahi katalog, mencari buku, membaca informasi dan sampel, menyimpan buku ke keranjang, menyelesaikan pembayaran melalui Midtrans, lalu membaca buku yang sudah dimiliki di **Perpustakaan Saya** melalui web reader.

Aplikasi juga menyediakan fitur pendukung seperti akun pribadi, riwayat pesanan, invoice, wishlist, bookmark, komentar dan evaluasi buku, agenda literasi, berita, komunitas, dan chatbot bantuan sesuai cakupan skenario yang tersedia. Fitur penerbit serta administrator merupakan dependensi operasional platform, tetapi **bukan cakupan desain pada PRD versi ini**.

**Pembatasan utama:** Berkas asli PDF yang diunggah penerbit **tidak disediakan untuk diunduh oleh pembeli**. Pembeli memperoleh hak baca setelah pembayaran berhasil dan telah divalidasi oleh sistem. Invoice transaksi, jika memenuhi syarat, adalah dokumen berbeda dan dapat diunduh. Pembatasan unduhan merupakan upaya mengurangi risiko pembajakan, bukan jaminan tidak mungkin disalin.

## 1.1 Masalah yang ingin diselesaikan

Dari kebutuhan mitra dalam proposal: penerbit memerlukan saluran bersama untuk menyediakan katalog dan akses baca digital; pembeli membutuhkan alur menemukan buku, membayar, lalu mengakses bacaan dengan jelas. Alur pembayaran dan pemberian hak baca perlu saling terhubung agar buku tidak dibuka sebelum transaksi tervalidasi. Sistem juga harus memberikan informasi transaksi yang bisa ditelusuri.

## 1.2 Outcome pengguna

- Pengunjung memahami bahwa IKAPI Store adalah tempat mencari dan membeli buku digital.
- Pembeli dapat menemukan buku lewat katalog, pencarian, dan kategori.
- Pembeli dapat menilai buku lewat informasi produk dan preview tanpa mengunduh buku penuh.
- Pembeli dapat memeriksa item dan total sebelum membayar.
- Pembeli mengetahui status transaksi serta tindakan lanjut yang tepat untuk setiap status.
- Pembeli dapat langsung menemukan buku yang telah diperoleh hak bacanya di Perpustakaan Saya.
- Pembaca dapat kembali ke posisi terakhir dan menggunakan bookmark.
- Pengunjung dapat menemukan agenda dan informasi literasi, serta pintu masuk komunitas.

## 1.3 Audiens dan peran

| Peran | Kebutuhan | Cakupan PRD |
|---|---|---|
| Pengunjung (belum login) | Menelusuri, mencari, melihat detail, preview dan informasi publik | Dalam cakupan |
| Pembeli (login) | Keranjang, checkout, pembayaran, pesanan, perpustakaan, review, profil | Dalam cakupan |
| Penerbit | Mengelola produk dan pemasukan | Di luar cakupan layar; menjadi sumber data katalog |
| Administrator | Mengelola operasional platform | Di luar cakupan layar |
| Payment gateway | Memproses pembayaran dan memberi status | Integrasi/ketergantungan sistem, bukan persona UI |

Tidak ada persona demografis, angka pembeli, jumlah katalog, atau hasil riset pengguna yang ditetapkan sebagai fakta pada sumber yang tersedia. Pengujian dengan calon pengguna tetap diperlukan.

---

# 2. Dokumen sumber, cakupan, dan urutan prioritas

## 2.1 Dokumen yang digunakan

| Sumber | Fungsi dalam PRD | Batas penggunaannya |
|---|---|---|
| `BPMN AS IS.drawio` | Membandingkan proses lama: pencarian/penjualan tersebar dan pembayaran manual | Konteks masalah, bukan fitur wajib sistem baru |
| `bpmn_tobe_fixed2.drawio` (gambar) | Alur target pembeli, pembayaran tervalidasi, akses baca | Diagram proses tingkat tinggi; tidak menetapkan semua detail UI |
| `USE CASE.drawio` | Cakupan aktor dan fungsi termasuk komunitas | Diagram memuat beberapa rancangan lama; keputusan terbaru mengungguli bagian yang sudah berubah |
| `SCENARIO USE CASE_TERBARU.docx` | Alur rinci, precondition, hasil, dan alternatif; **UC 1–27** untuk pembeli | Beberapa detail masih memerlukan keputusan produk |
| `ERD.drawio` | Entitas logis: akun, pelanggan, buku, order, ulasan, bookmark, event, komunitas | Bukan spesifikasi final API atau desain database |
| `SKEMA RELASI.drawio` | Referensi field dan relasi data yang relevan untuk tampilan | Tidak membenarkan pembuatan field UI baru tanpa kebutuhan |
| `Proposal_Abdimas_Online_Bookstore_...pdf` | Tujuan proyek, tiga peran, perlindungan PDF, pembayaran, dan contoh rancangan pada hlm. 5–8 | Gambar pada proposal adalah referensi kebutuhan/alur, bukan design system final |
| Repo `prototype-IKAPI`, branch `feature/breeze-auth-scaffold`, `docs/spec` | Sumber proyek terkait | Harus dibuka ulang pada commit/branch terbaru oleh agent sebelum desain |
| `docs/design/page-ref` | Referensi visual halaman bookstore | Mengarahkan komposisi dan elemen visual, bukan mengimpor fitur produk referensi |
| `docs/design/scrape-ref/DESIGN.md` | Bukti pengukuran visual terbatas dari Midtrans | Bukan template UI marketplace atau spesifikasi fitur |
| `docs/design/assets/assets.json` + `covers/` | 7 buku demo dan cover | Bukan inventaris atau harga resmi IKAPI |
| `docs/ilustration/README.md` + aset | Ilustrasi dan 3D yang sudah tersedia | Gunakan hanya yang cocok, jangan memaksa seluruh aset masuk UI |

**Referensi visual yang dikonfirmasi pada repo:** `beranda-page-ref.png`, desain Bookoe marketplace, profil buku, dan contoh dashboard e-book di `docs/design/page-ref/`. Bila agent tidak dapat membuka gambar asli, ia harus melaporkan keterbatasan dan tidak mengklaim telah melihatnya.

## 2.2 Hirarki keputusan ketika dokumen bertabrakan

1. **Keputusan terbaru pemilik produk di percakapan**: fokus pembeli; katalog simulasi; file e-book tidak dapat diunduh; agenda dan komunitas tetap ada.
2. **Skenario use case terbaru** untuk perilaku pembeli, kecuali yang secara eksplisit telah diganti oleh keputusan baru.
3. **Proposal dan BPMN TO-BE** untuk tujuan sistem dan ketergantungan transaksi/akses.
4. **Diagram ERD/skema relasi** untuk konteks data; jika tidak konsisten, catat konflik, jangan mengubah produk berdasarkan diagram saja.
5. **Referensi visual dan aset** untuk komposisi/estetika, bukan penetapan bisnis.

`DESIGN.md` di akar repository pernah berisi referensi visual bertema Notion, bukan design system IKAPI Store. Jangan menjadikannya acuan gaya utama secara otomatis. Buat design contract khusus IKAPI pada fase desain.

## 2.3 Status requirement

- **Confirmed:** dinyatakan dalam sumber dan/atau dikonfirmasi pemilik produk.
- **Specified, needs validation:** tercantum dalam salah satu sumber, tetapi memerlukan pemeriksaan implementasi atau penetapan detail.
- **Proposed UX:** saran penempatan/interaksi demi kejelasan; belum menjadi keputusan bisnis.
- **Open decision:** belum dapat dipastikan dari dokumen yang ada; jangan dikarang.

---

# 3. Ruang lingkup produk

## 3.1 In scope: pengalaman pembeli

1. Homepage publik dan navigasi utama.
2. Akun pembeli: registrasi, login, profil dan alur pemulihan/verifikasi yang tersedia pada scaffold.
3. Katalog, kategori, pencarian, hasil dan empty state.
4. Detail buku dan preview sampel.
5. Komentar pada detail buku dan evaluasi setelah pembelian.
6. Keranjang, ringkasan checkout, pilihan pembayaran Midtrans, serta status pembayaran/pesanan.
7. Riwayat pesanan, detail, dan unduh invoice transaksi lunas.
8. Perpustakaan Saya: Semua Buku, Sedang Dibaca, Belum Dibaca, Buku Favorit, pencarian koleksi.
9. Web reader: akses berbasis hak baca, posisi baca terakhir, navigasi dan bookmark.
10. Agenda event, kalender kegiatan, berita literasi dan detailnya.
11. Komunitas: pintu masuk/fungsi dasar yang telah terkonfirmasi; rincian forum masih perlu spesifikasi.
12. Chatbot bantuan/rekomendasi (prototype; kemampuan backend belum diverifikasi).
13. Riwayat buku terakhir dilihat.
14. UI desktop/mobile, state normal/empty/loading/error/success dan transisi prototype yang memang dapat diwujudkan.

## 3.2 Out of scope untuk paket desain ini

- Panel operasional penerbit dan administrator.
- Implementasi backend atau database baru, walaupun kebutuhan backend boleh didokumentasikan sebagai dependensi.
- Pengiriman buku fisik, ongkir, alamat penerima barang, tracking logistik.
- Fitur download e-book atau ekspor PDF penuh oleh pembeli.
- Berlangganan, langganan premium, poin loyalitas, flash sale, referral, atau promo yang belum didukung sumber.
- Jumlah pengguna, rating, omzet, review, jadwal event atau diskon rekaan.
- Menggandakan halaman hanya untuk menunjukkan teknologi, misalnya showcase reader/Midtrans di beranda.
- Social login, forum sosial lengkap, tiket event, atau pengaturan pembayaran tambahan tanpa kebutuhan yang terkonfirmasi.

---

# 4. Prinsip UX dan arahan desain yang mengikat

PRD berfokus pada apa yang harus dikerjakan produk; rincian token desain final sebaiknya dipisah dalam `DESIGN.md` khusus IKAPI. Namun prinsip berikut adalah **batas produk dan kualitas** yang harus dipatuhi saat menghasilkan desain di Stitch.

## 4.1 Identitas

IKAPI Store harus terasa seperti **toko buku digital modern**, bukan SaaS, dashboard analytics, atau presentasi teknis. Homepage berfungsi untuk menemukan buku. Detail buku untuk menilai dan membeli. Checkout untuk menyelesaikan transaksi. Web reader untuk membaca. Informasi hanya muncul saat relevan dengan tujuan tersebut.

## 4.2 Anti-AI-slop

- Jangan menambahkan badge/pill/dot/glow/emoji sebagai dekorasi default.
- Jangan memakai card rounded yang sama untuk setiap konten, headline, dan ilustrasi.
- Jangan menyisipkan label uppercase kecil di atas setiap judul hanya supaya terlihat premium.
- Jangan mengganti ornamen yang dihapus dengan ornamen lain yang sama tidak bergunanya.
- Ikon indikator yang bermakna boleh dipakai, seperti status transaksi, jumlah keranjang, tombol dropdown, atau state aktif.
- Jangan membuat hero SaaS generik. Buku, cover, dan ilustrasi bookstore adalah konten utama yang perlu menonjol.
- Copy harus natural, sederhana, dan terkait tindakan pembeli. Tidak wajib ada paragraf penjelas di setiap section.

**Contoh copy yang tidak boleh dipertahankan di homepage:** `Baca di browser, tanpa unduh berkas`, `Pembayaran lewat Midtrans Snap`, `Tiga judul lain di katalog yang sama`, kalimat teknis tentang webhook/lisensi server, serta pengumuman "contoh konten prototipe" sebagai isi utama section.

## 4.3 Penggunaan referensi dan aset

- Periksa `docs/design/page-ref/` untuk komposisi bookstore, `docs/design/assets/` untuk cover yang tersedia, `docs/ilustration/` untuk ilustrasi, dan `scrape-ref/` hanya sesuai relevansinya.
- Jika aset kurang, agent boleh mencari sendiri referensi dari Pinterest/Dribbble dan studi UI di website nyata (Chrome DevTools MCP/web search jika tersedia). Referensi Dribbble/Pinterest adalah inspirasi, **bukan lisensi** untuk menyalin desain atau gambar.
- Untuk aset final/demonstrasi, prioritaskan file milik proyek; setelah itu cari sumber gratis dengan ketentuan penggunaan yang cocok (mis. Unsplash, Pexels, unDraw, Lucide), verifikasi syarat dan atribusi, atau buat SVG orisinal yang konsisten.
- Jangan mencatut gambar acara nyata sebagai dokumentasi agenda IKAPI fiktif.
- Catat sumber/lisensi/penempatan aset yang dipakai.
- Jika browsing tidak tersedia, jangan mengaku sudah riset; gunakan aset repo dan tandai keterbatasannya.

## 4.4 Konten dan klaim

- Katalog demo memakai tujuh buku Standard Ebooks dengan harga **simulasi**. Jangan menganggapnya terbitan anggota IKAPI.
- Foto cover dan metadata harus berasal dari manifest, tanpa rating, angka ulasan, stok, atau diskon palsu.
- Konten agenda/berita harus berstatus terverifikasi atau diberi status mock di **dokumen produksi**, bukan dengan paragraf janggal di setiap card publik.
- Interface boleh menggambarkan contoh transaksi di prototype; tidak boleh mengklaim pembayaran sungguhan terjadi.

---

# 5. Arsitektur informasi dan navigasi

## 5.1 Peta navigasi utama

```text
IKAPI Store (public)
├─ Beranda
├─ Katalog
│  ├─ Kategori / hasil filter
│  ├─ Hasil pencarian
│  └─ Detail buku
│     ├─ Preview sampel
│     └─ Komentar / ulasan publik
├─ Agenda & Berita
│  ├─ Kalender / daftar acara
│  ├─ Detail acara
│  └─ Daftar / detail berita
├─ Komunitas [detail bentuk komunitas: pending]
├─ Login / Daftar
└─ Bantuan / Chatbot

Pembeli login
├─ Keranjang
├─ Checkout → Midtrans → Status transaksi
├─ Riwayat Pesanan → Detail → Invoice (jika lunas)
├─ Perpustakaan Saya
│  ├─ Semua Buku
│  ├─ Sedang Dibaca
│  ├─ Belum Dibaca
│  ├─ Buku Favorit
│  └─ Reader → Posisi baca / Bookmark
├─ Profil & keamanan akun
└─ Riwayat Buku Terakhir Dilihat (komponen kontekstual)
```

**Catatan:** Jalur dan nama halaman di atas adalah IA konseptual untuk desain. Bukan klaim bahwa route Laravel sudah ada atau sudah berfungsi.

## 5.2 Perjalanan utama: menemukan hingga membaca buku

```text
Beranda/Katalog → Cari/Filter → Detail → Preview (opsional)
                                        ↓
                                  Tambah ke Keranjang
                                        ↓
                                    Checkout
                                        ↓
                              Metode Pembayaran
                                        ↓
                   Pending / Gagal / Batal / Expired / Lunas
                                        ↓ (hanya setelah lunas tervalidasi)
                                 Perpustakaan Saya
                                        ↓
                                    Web Reader
                                ↙             ↘
                         Auto-resume        Bookmark
```

Pembeli yang belum login boleh melakukan penemuan buku publik; saat mencoba transaksi yang memerlukan akun, tampilkan alur masuk/daftar dengan konteks pilihan bukunya tidak hilang jika mekanismenya didukung.

## 5.3 Homepage: aturan penempatan konten

Homepage minimum mengutamakan header dan pencarian, hero bookstore, navigasi kategori, daftar buku yang relevan, preview agenda/berita jika kontennya tersedia, dan footer. Komunitas tersedia dalam navigasi. Riwayat terakhir dilihat dapat muncul secara kontekstual **hanya bila benar ada histori**. Tidak perlu membuat section pembayaran, mockup web reader, narasi infrastruktur Midtrans, atau koleksi buku duplikat.

---

# 6. Kebutuhan fungsional berdasarkan alur

> Semua ID `FR-*` di bawah adalah ID PRD baru untuk traceability, bukan ID tabel atau API.

## 6.1 Identitas dan akun (UC 01–03; tambahan dari scaffold autentikasi)

**FR-A01 Registrasi pembeli — confirmed.** Pengunjung dapat mendaftarkan akun dengan nama, email, nomor HP, dan password sebagaimana skenario use case. Validasi mencakup field wajib dan email yang sudah terdaftar; hasil sukses mengarahkan pengguna ke login sesuai skenario. Komponen login/register yang sudah ada dalam Laravel Breeze harus diperiksa karena field scaffold dapat berbeda.

**FR-A02 Login — confirmed.** Login menggunakan email dan password. Kredensial salah menimbulkan error yang bisa dipahami; password input dikosongkan sesuai skenario; pengguna tetap berada pada halaman masuk. Login berhasil mengarahkan ke pengalaman pembeli. Untuk pengguna yang baru diarahkan dari belanja, pengembalian ke konteks awal adalah usulan UX yang perlu dicek terhadap mekanisme aplikasi.

**FR-A03 Kelola profil — confirmed.** Pengguna login melihat serta mengubah data profil. Use case menyebut nama, foto, dan alamat; pendaftaran menyebut nomor HP. Field persis pada layar final harus diselaraskan dengan skema pengguna yang dipakai. Validasi file foto dan field wajib perlu state error.

**FR-A04 Pemulihan/verifikasi akun — existing scaffold, bukan UC 1–27.** Pada branch yang telah diperiksa sebelumnya terdapat route reset password, verifikasi email, dan konfirmasi password. Desain layar pelengkap ini diperlukan **sepanjang route/fitur tersebut memang dipakai**. Jangan mengarang login Google atau OTP SMS.

**State penting:** guest, logged in, validasi form, email duplikat, kredensial salah, proses submit, akses butuh login, sesi berakhir, reset email dikirim/gagal, tautan tidak valid jika flow dipakai.

## 6.2 Katalog, pencarian, filter, dan detail (UC 04–06, 21)

**FR-C01 Katalog — confirmed.** Menampilkan sampul, judul, penulis dan harga buku yang tersedia; navigasi ke detail. State katalog kosong dan gagal memuat harus jelas.

**FR-C02 Pencarian — confirmed.** Mendukung kata kunci judul/penulis dari beranda atau katalog. Halaman hasil mempertahankan kata kunci, menampilkan kecocokan, dan menyediakan state tidak ditemukan. Pencarian penerbit dapat dipertimbangkan jika data dan implementasi mendukung; skenario inti hanya menyebut judul/penulis.

**FR-C03 Filter kategori — confirmed.** Kategori yang disebut dalam use case mencakup Pendidikan, Teknologi, Bisnis, Sastra, Budaya. Filter menampilkan daftar yang relevan; state kategori kosong dan reset filter perlu terlihat. Kategori lain dari demo tidak boleh dipaksakan menjadi taxonomy resmi tanpa validasi.

**FR-C04 Detail buku — confirmed.** Memuat sampul, judul, penulis, penerbit, sinopsis, kategori, spesifikasi e-book yang tersedia, dan harga. Rating hanya tampil apabila data benar-benar tersedia. Detail memfasilitasi preview dan tambah keranjang serta komentar sesuai aturan akses.

**FR-C05 Riwayat dilihat — confirmed (UC27).** Buku yang dibuka dapat muncul sebagai Recently Viewed jika riwayat benar-benar ada. Jangan buat listing kosong yang seolah perilaku pengguna telah terekam, dan jangan menyebutnya rekomendasi personal.

**State penting:** daftar berisi data, list kosong, hasil pencarian ada/tidak ada, filter aktif/kosong, detail hilang/gagal diakses, sudah dimiliki, sedang memuat.

## 6.3 Preview dan komentar (UC 07–08)

**FR-B01 Preview sampel — confirmed.** Dari detail, pengguna dapat membaca beberapa halaman sampel jika aset sampel disediakan. Preview dibatasi pada konten sampel, bukan reader berlisensi penuh. Jika sampel tidak ada, muncul informasi yang jelas.

**FR-B02 Komentar detail — confirmed.** Pengguna login dapat mengetik komentar; submit hanya aktif untuk input yang layak. Skenario mencantumkan filter konten yang menolak ujaran tidak pantas/spam dan mempertahankan teks agar bisa diperbaiki. Tidak harus memunculkan istilah "smart content filter" pada UI.

**State penting:** preview ada/tidak ada/gagal, komentar kosong/valid/ditolak/gagal/terkirim, user guest membutuhkan login.

## 6.4 Keranjang dan pembuatan pesanan (UC 09–11)

**FR-K01 Tambah ke keranjang — confirmed.** Setelah login, pengguna dapat menambahkan buku, mendapat feedback, dan jumlah item di header disinkronkan.

**FR-K02 Kelola keranjang — confirmed dengan keputusan terbuka.** Keranjang menampilkan item, harga dan subtotal; pengguna dapat menghapus buku, total diperbarui. Skenario tertulis mendukung perubahan kuantitas. Karena produk utama berupa lisensi baca per akun, aturan pembelian banyak kuantitas **belum final**; jangan otomatis membangun quantity stepper untuk multi-lisensi sebelum diputuskan.

**FR-K03 Buat order — confirmed.** Pengguna meninjau item dan total, lalu mengonfirmasi pesanan dengan status awal menunggu pembayaran. Keranjang kosong tidak boleh masuk checkout. Pencegahan pembelian ulang buku yang sudah dimiliki disebut dalam proposal sebagai rancangan; kebijakan final perlu disepakati.

**State penting:** keranjang kosong/berisi item, item berhasil ditambah, item dihapus, penghitungan total, belum login, duplikasi hak baca, gagal menyimpan/mengubah, submit berulang.

## 6.5 Checkout, Midtrans, status transaksi (UC 12–16)

**FR-P01 Metode pembayaran — confirmed.** Pembeli memilih metode yang didukung integrasi. Skenario menyebut transfer bank, e-wallet, QRIS, dan pada alur pembayaran juga kartu kredit. **Metode yang benar-benar tersedia mengikuti konfigurasi provider**, bukan daftar visual rekaan. Jika metode belum dipilih padahal dibutuhkan, tampilkan validasi.

**FR-P02 Rincian total dan batas bayar — confirmed.** Tampilkan item, subtotal, biaya layanan/diskon **jika memang ada**, total, serta waktu kedaluwarsa **jika ditetapkan dari transaksi**. Angka 24 jam di skenario hanyalah contoh, bukan default yang boleh di-hardcode.

**FR-P03 Pembayaran — confirmed.** UI terhubung secara konseptual ke Midtrans. Tidak boleh membuat QRIS/VA/nomor transaksi palsu yang disajikan sebagai data produksi. Hasil pembayaran tidak ditentukan dari keberhasilan menutup popup, melainkan status yang tervalidasi aplikasi.

**FR-P04 Status pembayaran — confirmed.** Bedakan minimal menunggu, lunas/berhasil, kedaluwarsa, dan kondisi batal/gagal saat diwakili flow. Status membutuhkan aksi lanjutan yang jelas. Skenario menyebut pembatalan mengembalikan buku ke keranjang; detail perilaku ini harus cocok dengan sistem akhir.

**FR-P05 Akses pascapembayaran — confirmed.** Hanya setelah status pembayaran berhasil **dan tervalidasi**, buku masuk Perpustakaan Saya dan hak baca aktif. Menunggu/gagal/batal/expired **tidak** mengaktifkan buku. Status order dan status entitlement tidak boleh dicampur.

**FR-P06 Pengingat pembayaran — specified, needs validation.** Skenario menyebut satu pengingat setelah satu jam, namun media pengingat dan implementasi belum diverifikasi. Ini bukan alasan membuat banner reminder permanen di semua halaman.

**State penting:** membuat order, memilih metode, menunggu pembayaran, terverifikasi berhasil, batal, gagal, kedaluwarsa, percobaan ulang sesuai aturan, validasi status tertunda, tidak dapat menghubungi gateway.

## 6.6 Riwayat pembelian dan invoice (UC 17, 22)

**FR-O01 Riwayat pesanan — confirmed.** Pengguna login dapat melihat transaksi, tanggal, total, dan status. Bila belum pernah memesan, tampilkan state kosong dan arahkan ke katalog.

**FR-O02 Detail pesanan — konsekuensi UI dari FR-O01 dan status pembayaran.** Tampilkan identitas pesanan, daftar buku, total, metode/status bila tersedia, batas bayar jika relevan, dan tindakan sesuai status. Ini bukan halaman pengiriman barang.

**FR-O03 Unduh invoice — confirmed.** Untuk transaksi **lunas**, pengguna boleh mengunduh invoice PDF. Jika pembuatan file gagal, tampilkan feedback dan opsi coba lagi. **Invoice tidak sama dengan file e-book**; jangan tampilkan unduh PDF buku.

## 6.7 Perpustakaan, web reader, bookmark (UC 18–19, 23–24)

**FR-L01 Perpustakaan pribadi — confirmed.** Menampilkan empat kelompok: **Semua Buku, Sedang Dibaca, Belum Dibaca, Buku Favorit**. Buku yang dimiliki berasal dari transaksi berhak baca aktif. Favorit adalah wishlist yang dapat mencakup buku belum dibeli; jangan menganggap favorit = dimiliki.

**FR-L02 Cari koleksi — confirmed.** Pencarian berdasarkan judul dalam perpustakaan, bukan katalog global. No-results membedakan "tidak ada dalam koleksi" dari "tidak ada di marketplace".

**FR-L03 Akses reader — confirmed.** Sebelum membuka konten penuh, sistem memeriksa hak baca. Jika belum berhak, tampilkan error/arah tindakan sesuai konteks. Jangan munculkan tombol "Baca Buku" pada item yang tidak dimiliki sebagai aksi yang berhasil begitu saja.

**FR-L04 Auto-resume — confirmed.** Reader membuka posisi terakhir dibaca dan memperbaruinya otomatis saat berpindah halaman. Feedback penyimpanan tidak harus muncul pada setiap perpindahan.

**FR-L05 Bookmark — confirmed.** Pengguna dapat menandai halaman, mendapat feedback ketika ditambahkan, dan penanganan jika halaman sudah ditandai.

**FR-L06 Tidak ada unduhan buku — confirmed.** Tidak ada tombol unduh maupun ekspor PDF e-book penuh. Konten dibaca melalui reader website. Perancangan harus mempertimbangkan format PDF dan tidak mengasumsikan seluruh teks dapat direflow seperti EPUB.

**State penting:** belum punya buku, belum membaca, sedang membaca, buku favorit, pencarian koleksi kosong, sedang memuat halaman, gagal memuat, akses tidak sah, progres tersimpan, bookmark baru/sudah ada.

## 6.8 Evaluasi dan ulasan pascapembelian (UC 20)

**FR-R01 Form evaluasi — confirmed.** Pengguna yang sudah menyelesaikan pembelian dapat mengisi ulasan teks dan empat dimensi penilaian skala 1–5: kesesuaian ekspektasi, kebermanfaatan isi, kesesuaian harga, peluang membeli lagi dari penerbit tersebut. Validasi kelengkapan dan state submit diperlukan.

**FR-R02 Komentar vs evaluasi — confirmed distinction.** Komentar pada detail buku (UC07) dan evaluasi pascapembelian (UC20) tidak otomatis dianggap form yang sama. UI harus mencerminkan kondisi penggunanya.

**FR-R03 Agregasi rating — specified, needs validation.** Skenario menyebut perhitungan evaluasi penerbit, tetapi sumber data real belum tersedia. Jangan membuat angka rating palsu pada demo.

## 6.9 Agenda literasi, berita, komunitas (UC 25 + diagram use case)

**FR-E01 Agenda — confirmed.** Menampilkan kalender jadwal kegiatan dan daftar agenda bila ada. Pengguna dapat membuka detail kegiatan yang berisi informasi yang tersedia (judul, tanggal, lokasi/format, penjelasan). Jangan mengarang jadwal resmi.

**FR-E02 Berita — confirmed.** Menampilkan daftar ringkasan berita dan halaman artikel. Jika belum ada artikel terverifikasi, gunakan empty state atau demo yang statusnya jelas dalam proyek.

**FR-E03 Komunitas — confirmed keberadaan, detail belum final.** Diagram use case menyebut akses forum komunitas dan agenda; diagram data memuat komunitas/anggota. Desain perlu pintu masuk komunitas yang koheren tetapi **bentuk forum, posting, moderasi, join/leave, dan profil komunitas** belum ditetapkan terperinci. Ini keputusan terbuka; jangan membuat fitur sosial besar tanpa keputusan.

## 6.10 Chatbot bantuan dan rekomendasi (UC 26)

**FR-H01 Widget bantuan — confirmed.** Pengguna dapat membuka panel chat, mengirim pertanyaan terkait buku/promo/bantuan transaksi, dan menerima jawaban dalam konteks prototype jika data tersedia.

**FR-H02 Rekomendasi buku — confirmed intent, implementation unknown.** Jawaban yang menyebut buku harus merujuk produk yang ada dalam dataset; jangan menciptakan buku/tautan palsu atau mengklaim mesin AI sudah berjalan.

**FR-H03 Batasan pertanyaan — confirmed.** Pertanyaan di luar cakupan dapat diarahkan ke jalur kontak pengelola yang benar. Jangan membuat kontak resmi yang belum diverifikasi.

---

# 7. Screen inventory dan spesifikasi layar untuk desain

Tabel ini adalah **daftar target frame**, bukan klaim setiap frame sudah ada di repository. "Screen" boleh menjadi halaman, panel, modal, atau state dalam satu flow. Jangan menggandakan frame hanya untuk memenuhi jumlah layar.

| ID | Frame / area | Jenis | UC terkait | Prioritas |
|---|---|---|---|---|
| S01 | Beranda | Halaman publik | 04,05,21,25,27 | P0 |
| S02 | Login | Halaman auth | 02 | P0 |
| S03 | Registrasi pembeli | Halaman auth | 01 | P0 |
| S04 | Pemulihan / verifikasi akun | Flow auth pendukung | Scaffold auth | P1 |
| S05 | Profil dan keamanan akun | Halaman akun | 03 | P1 |
| S06 | Katalog + kategori | Halaman katalog | 04,21 | P0 |
| S07 | Hasil pencarian | State/halaman katalog | 05 | P0 |
| S08 | Detail buku | Halaman produk | 06,07,08,09 | P0 |
| S09 | Preview sampel buku | Modal/halaman preview | 08 | P1 |
| S10 | Keranjang | Halaman transaksi | 09,10 | P0 |
| S11 | Checkout / ringkasan | Halaman transaksi | 11,12,14 | P0 |
| S12 | Pembayaran dan status | Flow/state transaksi | 12–16 | P0 |
| S13 | Riwayat dan detail pesanan | Halaman akun | 15–17,22 | P0 |
| S14 | Perpustakaan Saya | Halaman akun | 18,23,24 | P0 |
| S15 | Web reader + bookmark | Pengalaman membaca | 18,19 | P0 |
| S16 | Komentar dan evaluasi | Form/section kontekstual | 07,20 | P1 |
| S17 | Agenda + berita + detail | Halaman editorial | 25 | P1 |
| S18 | Komunitas | Halaman publik/akun | Use-case diagram | P1, detail terbuka |
| S19 | Chatbot bantuan | Widget/panel | 26 | P2 |
| S20 | Terakhir Dilihat | Komponen kontekstual | 27 | P2 |

**P0** = alur buku digital utama, **P1** = kelengkapan pengalaman pembeli, **P2** = fitur pendukung. Ini prioritas rancangan usulan, bukan jadwal pembangunan yang sudah disetujui.

## S01 — Beranda

**Tujuan:** Memperkenalkan toko buku, mempermudah pencarian dan eksplorasi koleksi.  
**Konten minimum:** brand, kolom cari judul/penulis, navigasi katalog/kategori/agenda/komunitas, hero ilustratif bookstore, kategori, koleksi buku, preview agenda hanya jika konten tersedia, footer.  
**Interaksi:** pencarian → S07; kategori/katalog → S06; cover/judul → S08; login/keranjang → S02/S10; agenda → S17; komunitas → S18.  
**State:** guest/login, ada buku, koleksi kosong, recently-viewed hanya bila ada data.  
**Larangan:** showcase Midtrans, kartu reader besar, informasi API/invoice, duplikasi listing, klaim "ribuan judul" yang tidak terverifikasi, badge dekoratif.  
**Kriteria:** Pengunjung bisa memahami apa yang dijual dan menemukan buku tanpa membaca promosi teknis.

## S02 — Login

**Tujuan:** Mengakses area yang membutuhkan akun.  
**Konten:** email, password, tampil/sembunyikan password, Masuk, Daftar, Lupa Password bila flow tersedia.  
**Interaksi:** validasi, submit, error kredensial, kembali ke tujuan awal jika didukung.  
**State:** idle, submitting, invalid input, invalid credentials, success.  
**Kriteria:** Form sederhana, error di lokasi relevan, tidak ada social login fiktif dan tidak perlu panel promosi penuh ornamen.

## S03 — Registrasi pembeli

**Tujuan:** Membuat akun untuk bertransaksi dan membaca.  
**Konten:** nama, email, nomor HP, kata sandi, konfirmasi jika dibutuhkan; field persis diselaraskan dengan use case dan implementasi.  
**Interaksi:** validasi wajib, email sudah terpakai, kembali login.  
**State:** idle, invalid, submitting, registered.  
**Kriteria:** Satu alur mudah dibaca; tidak meminta data di luar kebutuhan dan tidak mengasumsikan login pihak ketiga.

## S04 — Lupa password / reset / verifikasi

**Tujuan:** Mendukung flow auth yang sudah ada pada scaffold, jika diaktifkan.  
**Konten:** form email untuk reset, form password baru, pesan cek email, aksi kirim ulang verifikasi, tautan kembali login.  
**State:** email terkirim, token tidak valid/kedaluwarsa, invalid password, throttled, success.  
**Kriteria:** Penjelasan singkat dan jelas; status sukses/gagal tidak dibuat-buat. Jangan memperkenalkan OTP SMS jika tidak ada.

## S05 — Profil pembeli

**Tujuan:** Melihat/memperbarui informasi akun.  
**Konten:** nama, email, nomor HP, foto, alamat jika relevan dengan skema/fitur yang digunakan; akses ke keamanan akun, pesanan dan perpustakaan.  
**Interaksi:** edit dan simpan, validasi field, unggah foto bila tersedia, ubah password melalui mekanisme auth.  
**State:** data tersedia, saving, saved, error, foto tidak sesuai.  
**Kriteria:** Halaman account settings, bukan dashboard dengan statistik dekoratif.

## S06 — Katalog dan kategori

**Tujuan:** Menemukan buku melalui eksplorasi, filter kategori, dan daftar produk.  
**Konten:** pencarian, kategori yang tersedia, buku (cover–judul–penulis–harga), filter aktif, kontrol reset, pengurutan hanya jika data mendukung.  
**Interaksi:** pilih kategori, reset filter, buka buku; pengurutan dan pagination/load-more merupakan pola UI yang dipilih berdasar jumlah data dan kebutuhan, bukan fitur wajib yang selalu ditambahkan.  
**State:** semua buku, kategori aktif, kategori tanpa buku, loading, error.  
**Mobile:** filter terjangkau dan grid tidak dipaksa sekecil dashboard.  
**Kriteria:** Cover menarik dan konsisten; tidak ada kategori dengan hitungan palsu; jangan menambah "Top Rated" bila tidak ada rating.

## S07 — Hasil pencarian

**Tujuan:** Menemukan judul atau penulis spesifik.  
**Konten:** kata kunci yang terlihat, hasil yang cocok, filter bila relevan, clear search.  
**Interaksi:** submit/ubah query, buka detail; saran autocomplete opsional hanya jika benar-benar didukung.  
**State:** query kosong, berisi hasil, tidak ada hasil, fetching, error, gabungan filter kosong.  
**Kriteria:** UI menggunakan komponen produk S06; no-results membantu mengubah pencarian tanpa copy bercanda/cringe.

## S08 — Detail buku

**Tujuan:** Membantu menilai isi dan membeli sebuah buku.  
**Konten:** cover proporsional, judul, penulis, penerbit, harga simulasi, kategori, sinopsis, metadata yang tersedia, aksi preview, tambah keranjang, komentar jika dipakai.  
**Interaksi:** preview → S09, tambah → S10, komentar → S16; bila sudah dimiliki, tampilkan aksi baca yang sesuai.  
**State:** belum punya, sudah punya, tidak tersedia, detail gagal dimuat, preview tidak tersedia, belum login.  
**Kriteria:** Tidak ada ongkir, stok fisik, countdown promosi, rating palsu, tombol unduh e-book, ataupun copy pemrosesan server.

## S09 — Preview sampel

**Tujuan:** Menunjukkan bagian terbatas dari buku sebelum pembelian.  
**Konten:** judul, identitas buku, halaman sampel yang memang tersedia, kontrol navigasi sampel, kembali ke detail.  
**Interaksi:** buka/tutup, next/previous pada sampel, transisi ke detail.  
**State:** sampel tersedia, tidak tersedia, gagal memuat.  
**Kriteria:** Tidak membuka isi penuh, tidak memberikan PDF, tidak membuat kontrol yang tidak berfungsi.

## S10 — Keranjang

**Tujuan:** Meninjau buku yang akan dibeli dan total.  
**Konten:** tiap cover, judul, penulis, harga, hapus item, subtotal/total, tombol checkout.  
**Interaksi:** hapus item dengan penanganan yang layak, perbarui jumlah item/cart badge, checkout.  
**State:** kosong, berisi, update pending, error, item sudah dimiliki.  
**Kriteria:** Tidak ada shipping, ongkir, alamat pengiriman atau quantity stepper sebelum aturan pembelian ganda dikonfirmasi.

## S11 — Checkout

**Tujuan:** Memastikan isi pesanan dan biaya sebelum menuju pembayaran.  
**Konten:** ringkasan item, informasi akun yang diperlukan, subtotal, biaya lain hanya jika nyata/berlaku, total, aksi lanjut pembayaran.  
**Interaksi:** kembali keranjang, konfirmasi order, cek kondisi akun dan item.  
**State:** valid, keranjang kosong, invalid, creating order, gagal membuat order, sukses membuat order.  
**Kriteria:** Tidak ada formulir alamat logistik, tidak ada diskon/biaya rekaan, total jelas.

## S12 — Midtrans dan status transaksi

**Tujuan:** Memberi pengalaman pembayaran dan feedback status yang akurat.  
**Konten:** nomor pesanan, nominal, pilihan metode yang benar-benar didukung, instruksi dari provider, batas bayar bila tersedia, status.  
**Interaksi:** lanjut bayar, cek status, kembali ke riwayat, retry sesuai ketentuan.  
**State wajib:** menunggu, lunas dan terverifikasi, gagal, batal, kedaluwarsa, status belum terkonfirmasi.  
**Kriteria:** Book entitlement hanya aktif setelah verifikasi lunas; jangan menampilkan QR/VA fabricated sebagai data produksi; Snap tidak perlu ditiru pixel-per-pixel.

## S13 — Riwayat dan detail pesanan

**Tujuan:** Menelusuri transaksi dan bukti pembayaran.  
**Konten:** daftar tanggal, nomor transaksi, jumlah/total, status, detail item; invoice PDF hanya bagi pesanan lunas.  
**Interaksi:** buka detail, unduh invoice, cek kembali pembayaran, menuju Perpustakaan jika sudah memiliki akses.  
**State:** kosong, berisi, pending, lunas, expired, failed, gagal membuat invoice.  
**Kriteria:** Invoice selalu diberi nama jelas agar tidak disalahartikan sebagai unduhan buku.

## S14 — Perpustakaan Saya

**Tujuan:** Mengakses buku milik sendiri dan wishlist.  
**Konten:** empat kelompok **Semua Buku / Sedang Dibaca / Belum Dibaca / Buku Favorit**, cari koleksi, cover dan aksi baca, progres bila ada.  
**Interaksi:** tab/filter kelompok, pencarian, membuka reader, membuka detail item wishlist.  
**State:** belum punya buku, punya tetapi belum dibaca, sedang dibaca, tidak ada favorit, pencarian tanpa hasil.  
**Kriteria:** Favorit bukan berarti sudah dibeli. User tanpa entitlement tidak mendapat akses reader penuh.

## S15 — Web reader

**Tujuan:** Membaca buku dengan nyaman dan meneruskan posisi baca.  
**Konten:** halaman bacaan, judul buku, navigasi, posisi/progres, daftar isi jika data mendukung, bookmark.  
**Interaksi:** prev/next, auto-resume, simpan posisi, tambah bookmark, kembali perpustakaan.  
**State:** loading, loaded, load error, akses belum aktif, bookmark sudah ada/baru.  
**Kriteria:** Tidak ada export/download file buku; desain realistis untuk dokumen PDF dan tidak meniru kelebihan aplikasi EPUB yang tidak didukung.

## S16 — Komentar dan evaluasi

**Tujuan:** Memfasilitasi komentar di detail dan evaluasi mutu setelah membeli.  
**Konten:** daftar komentar nyata/demo dengan provenance, form komentar, form evaluasi 4 kriteria skala 1–5 bila eligible.  
**Interaksi:** kirim, validasi, edit teks yang ditolak filter, feedback sukses.  
**State:** guest, eligible/not eligible, invalid, blocked content, submit, success.  
**Kriteria:** Tidak membuat avatar dan rating palsu; komentar dan evaluasi tidak digabung sembarangan.

## S17 — Agenda, kalender, berita dan detail

**Tujuan:** Menemukan kegiatan literasi dan informasi yang diterbitkan.  
**Konten:** kalender event, daftar ringkasan kegiatan, detail event, daftar dan detail berita yang tersedia.  
**Interaksi:** pilih tanggal, pilih acara/berita, kembali daftar.  
**State:** ada jadwal, tidak ada jadwal, detail tersedia/hilang, loading/error.  
**Kriteria:** Tidak menciptakan pendaftaran acara, penjualan tiket atau pemberitahuan resmi tanpa requirement; tidak memakai poster acara nyata untuk isi fiktif.

## S18 — Komunitas

**Tujuan:** Menyediakan pintu masuk komunitas pembaca/literasi IKAPI.  
**Konten awal yang aman:** judul, penjelasan ringkas, direktori komunitas jika data benar-benar tersedia, tautan agenda/aktivitas yang relevan.  
**Interaksi dan detail:** bentuk forum dan keanggotaan masih **open decision**. Agent harus meminta definisi sebelum membuat posting, komentar forum, private messaging, sistem join, badge member atau leaderboard.  
**Kriteria:** Halaman awal tetap berguna dan tidak berpura-pura ada aktivitas komunitas atau data anggota yang belum tersedia.

## S19 — Chatbot bantuan

**Tujuan:** Memberi jalur pertanyaan dan rekomendasi dalam batas katalog/fitur yang ada.  
**Konten:** launcher, chat panel, input dan message list, loading/error, tautan katalog relevan ketika jawaban berbasis buku.  
**Interaksi:** buka, tulis, kirim, tutup, kembali ke bantuan/kontak jika tidak terjawab.  
**Kriteria:** Tidak mengklaim model AI/backend aktif tanpa bukti; tidak membuat rekomendasi/QR/promo palsu. Tidak ada orb/mascot/glow dekoratif.

## S20 — Terakhir Dilihat

**Tujuan:** Membantu pengguna kembali ke detail buku yang pernah dibuka.  
**Konten:** daftar ringkas cover dan judul berdasarkan histori aktual/simulasi yang tersedia.  
**Interaksi:** buka lagi detail.  
**State:** riwayat berisi/kosong.  
**Kriteria:** Jika tidak ada riwayat, komponen disembunyikan atau state ringkas; jangan menyebutnya personalisasi rekomendasi AI.

---

# 8. Status, izin, dan aturan tampilan

## 8.1 Matriks akses

| Tindakan | Pengunjung | Pembeli login tanpa kepemilikan | Pembeli dengan hak baca aktif |
|---|---|---|---|
| Lihat beranda, katalog dan detail | Ya | Ya | Ya |
| Cari dan filter buku | Ya | Ya | Ya |
| Preview sampel yang tersedia | Ya, jika kebijakan membolehkan | Ya | Ya |
| Tambah buku ke keranjang | Arahkan login sesuai UC09 | Ya, jika belum dimiliki | Jangan membeli ulang tanpa aturan yang jelas |
| Checkout | Butuh login | Ya | Untuk buku baru saja |
| Komentar detail | Butuh login | Ya sesuai UC07 | Ya |
| Evaluasi pascapembelian | Tidak | Tidak | Ya jika memenuhi syarat UC20 |
| Lihat riwayat dan invoice milik sendiri | Tidak | Ya jika punya transaksi | Ya |
| Perpustakaan Saya | Butuh login | Menampilkan empty/wishlist | Menampilkan koleksi yang dimiliki |
| Web reader konten penuh | Tidak | Tidak | Ya |
| Bookmark halaman reader | Tidak | Tidak | Ya |
| Agenda dan berita publik | Ya | Ya | Ya |

**Catatan:** Ada implikasi operasional dari auth dan entitlement yang harus ditegakkan oleh sistem nyata. Prototype UI saja tidak dapat membuktikan pembatasan akses secara aman.

## 8.2 Matriks status transaksi dan akses

| Status pesanan/pembayaran | Pesan untuk pembeli | Tindakan yang relevan | Reader penuh |
|---|---|---|---|
| Menunggu pembayaran | "Menunggu Pembayaran" | Lihat instruksi/cek status | Tidak |
| Pembayaran berhasil dan **terverifikasi** | "Pembayaran Berhasil" | Buka Perpustakaan | Ya |
| Pembayaran gagal | "Pembayaran Belum Berhasil" | Coba lagi jika disediakan | Tidak |
| Dibatalkan | "Pembayaran Dibatalkan" | Kembali ke pesanan/katalog sesuai aturan | Tidak |
| Kedaluwarsa | "Batas Waktu Pembayaran Berakhir" | Buat transaksi ulang jika diizinkan | Tidak |
| Status belum sinkron/menunggu verifikasi | "Status Pembayaran Sedang Diperiksa" | Periksa status lagi | Tidak sampai tervalidasi |

Istilah UI boleh disesuaikan melalui UX writing, tetapi state logisnya tidak boleh dicampur. **Jangan buat state sukses hanya karena pengguna kembali dari payment page**.

## 8.3 Aturan tampilan data simulasi

- Demo title/author/cover diambil dari `assets.json` dan `covers/`.
- Harga contoh adalah fixture prototipe, bukan data penerbit IKAPI.
- Jangan membuat inventaris resmi, ratusan ulasan, status best seller, jumlah peserta event, atau tingkat kepopuleran tanpa bukti.
- Penggunaan demo harus dikelola pada level dataset, handoff dan presentasi; jangan menaruh paragraf "Ini hanya prototype" yang panjang pada setiap section.
- Untuk data demo yang ditampilkan pada mockup pembayaran/status, gunakan contoh yang konsisten antarframe dan dokumentasikan bahwa statusnya simulasi.

---

# 9. Model data konseptual untuk kebutuhan antarmuka

Model berikut adalah **view model**, bukan desain ulang database.

| Entitas UI | Data minimum yang diperlukan pada layar | Sumber konsep |
|---|---|---|
| Account/Profile | id pengguna, nama, email, nomor HP; foto/alamat bila dipakai | UC01–03, Akun_Login/Pelanggan |
| Book | id buku, judul, cover, penulis, penerbit, kategori, sinopsis, harga | UC04–08, Buku/Penerbit/Penulis |
| Cart | daftar buku, harga saat dipilih, subtotal | UC09–10 |
| Order | id pesanan, tanggal, item, total, status pembayaran | UC11–17, Order/Detail_Order |
| Payment | metode aktif, instruksi, status, batas waktu jika ada | UC12–16, Midtrans |
| Entitlement | user, buku, status hak baca | Proposal dan UC18 |
| Library & reading position | buku milik sendiri, progres/posisi terakhir | UC18,23 |
| Bookmark | buku/halaman/catatan bila tersedia | UC19, Bookmark |
| Comment/Evaluation | isi teks, rating penilaian pascapembelian, identitas penulis komentar | UC07,20; Ulasan |
| Event/News | judul, jadwal, keterangan, kategori/jenis, konten berita bila tersedia | UC25; Event/Jadwal_Event |
| Community | nama dan relasi anggota bila disetujui | Use-case diagram; Komunitas/Anggota_Komunitas |
| Recently viewed | user/sesi, buku, urutan dilihat | UC27 |

**Kesenjangan data:** Tidak seluruh field pada tabel di atas tergambar lengkap di ERD/Skema Relasi. Misalnya struktur detail hak baca, news article, wishlist, histori dilihat, dan session chat tidak sepenuhnya terlihat pada diagram. Untuk desain prototype boleh dibuat *view fixture* yang eksplisit; desain tersebut **tidak boleh dianggap sebagai tabel database yang sudah ada**.

---

# 10. Kebutuhan nonfungsional dan kualitas interaksi

| ID | Requirement | Cara evaluasi prototipe |
|---|---|---|
| NFR-01 | Konsistensi navigasi, tipografi, spacing dan simbol UI | Review frame silang, desktop/mobile |
| NFR-02 | Responsive, bukan desktop yang hanya diperkecil | Periksa layout desktop dan mobile; tidak terpotong atau overflow tak disengaja |
| NFR-03 | Keterbacaan dan kontras memadai | Periksa text, border, state error, keyboard focus; acuan WCAG 2.2 |
| NFR-04 | Action label jelas dan berbasis tujuan pengguna | Audit CTA dan destinasi tiap frame |
| NFR-05 | State dasar lengkap | Normal, empty, loading, error; success hanya ketika relevan |
| NFR-06 | Konsistensi status transaksi/hak akses | Simulasi lintas frame: pending ≠ memiliki buku |
| NFR-07 | Tidak mengungkap/mendistribusikan PDF asli via UI | Audit semua tombol reader/preview/orders |
| NFR-08 | Desain tidak mengarang data/fitur | Cocokkan setiap klaim dengan fixture/sumber |
| NFR-09 | Aset legal dan relevan | Daftar sumber, lisensi, atribut dan penggunaan |
| NFR-10 | Interaksi prototipe terhubung | Klik navigasi inti, back behavior, state transisi yang disediakan tool |
| NFR-11 | Performa dan keamanan backend sebagai kebutuhan implementasi | **Tidak dapat divalidasi dengan Stitch saja**; masuk handoff pengembang |

Jangan menetapkan target numerik performa, konversi, traffic, atau persentase retensi sebagai hasil terukur tanpa baseline dan rencana pengujian. Target terukur bisa ditetapkan setelah pengujian nyata.

---

# 11. UX writing dan content policy

## 11.1 Bahasa

Bahasa utama antarmuka Indonesia; istilah buku/checkout yang lazim dapat dipakai konsisten. Pesan harus membantu pengguna mengetahui **apa yang terjadi dan apa tindakan selanjutnya**. Hindari jargon internal untuk pengguna umum.

| Konteks | Disarankan | Hindari |
|---|---|---|
| Katalog | "Katalog Buku", "Cari judul atau penulis" | "Stack katalog terintegrasi" |
| Detail | "Lihat Preview", "Tambah ke Keranjang" | "Lisensi e-reader otomatis" sebagai promosi |
| Checkout | "Ringkasan Pesanan", "Total Pembayaran" | "Integrasi payment gateway Midtrans Snap" sebagai headline |
| Menunggu | "Menunggu Pembayaran" | "Callback sedang diproses server" |
| Reader | "Lanjutkan Membaca", "Tandai Halaman" | "Auto-resume engine" |
| Invoice | "Unduh Invoice" | "Unduh PDF" tanpa menjelaskan PDF apa |
| Kosong | "Belum ada buku di perpustakaan" | "Rak ajaibmu belum diisi petualangan" |
| Error | "Gagal memuat buku. Coba lagi." | "Oops! Sihirnya sedang istirahat" |

## 11.2 Larangan copy yang tidak perlu

- Headline berisi nama teknologi alih-alih manfaat/tindakan dalam konteksnya.
- Penjelasan tentang browser, API, webhook, token, PDF, dan pembayaran otomatis dalam hero utama.
- Subtitle yang menjelaskan ulang judul section.
- Teks "contoh prototipe" sebagai deskripsi publik setiap item.
- Klaim resmi, aman 100%, bebas pembajakan, ribuan judul, rating, atau diskon yang tidak bersumber.
- Pengulangan kata "jelajahi", "temukan", "eksplorasi" pada semua blok tanpa tujuan yang berbeda.

---

# 12. Kebijakan referensi visual dan sumber aset untuk Stitch

## 12.1 Perbedaan tiga jenis referensi

| Jenis | Contoh | Perlakuan |
|---|---|---|
| Product requirements | Use case/BPMN/proposal | Menentukan flow, hak akses, data, state |
| Visual references | `page-ref` dan visual bookstore | Menentukan komposisi/estetika, **bukan fungsi baru** |
| Style measurements | `scrape-ref` Midtrans | Boleh memengaruhi inspirasi style dalam konteks terbatas, bukan materi homepage |

## 12.2 Sourcing mandiri

Jika ilustrasi, banner, SVG, icon atau foto tidak cukup: cari dulu di repository; lalu cari opsi gratis yang legal dan sesuai; terakhir buat visual orisinal. Rekam judul/source URL, izin lisensi, apakah perlu atribusi, tujuan penggunaan, dan keputusan seleksi. Jangan hanya mencari Google Images lalu menyalin.

## 12.3 Risiko spesifik desain IKAPI

- **Cover buku** dari demo Standard Ebooks: pastikan cover dan atribusinya benar, jangan mengganti artwork dengan blok warna.
- **Banner:** harus terasa seperti banner foto/ilustrasi bookstore, bukan hero SaaS yang ditempeli copy teknis.
- **Kategori:** visualnya boleh dibuat khusus; hindari emoji OS atau ikon random yang gaya berbeda.
- **Icon:** gunakan set SVG konsisten (misalnya Lucide) atau custom SVG yang benar-benar sejenis; jangan mencampur 3D lucu dengan outline minimal tanpa alasan.
- **Event:** bila data belum tersedia, jangan memakai poster real yang membuat klaim agenda palsu.
- **Mobile:** navigasi "Kategori" bila dropdown menggunakan chevron yang benar, bukan karakter `V` statis.

---

# 13. Risiko, konflik sumber, dan keputusan terbuka

| ID | Topik | Fakta dari sumber | Status / keputusan yang diperlukan | Dampak jika ditebak |
|---|---|---|---|---|
| OD-01 | Kuantitas di keranjang | UC10 mengizinkan ubah jumlah; produk e-book memberi akses per akun | **Terbuka:** apakah pembelian beberapa lisensi untuk judul sama didukung? | Quantity stepper salah, duplikasi hak baca |
| OD-02 | Komunitas | Use-case diagram menyebut forum; ERD punya Komunitas/Anggota; scenario pembeli tidak merinci forum | **Terbuka:** direktori, join/leave, forum, jenis posting dan moderator? | Agent membuat aplikasi sosial fiktif |
| OD-03 | Preview buku | UC08 menetapkan beberapa halaman sampel | **Terbuka:** panjang dan sumber sampel per buku | Preview menampilkan isi yang tidak diizinkan |
| OD-04 | Metode pembayaran | UC12/13 menyebut beberapa saluran | **Validasi konfigurasi:** channel aktif dalam Midtrans | Opsi tidak benar-benar tersedia |
| OD-05 | Durasi kedaluwarsa | UC14 menulis "misal 24 jam" | **Terbuka/berdasar transaksi:** bukan 24 jam tetap | Timer palsu |
| OD-06 | Wishlist | UC23 menyebut Buku Favorit | **Terbuka:** kapan dan dari halaman mana tindakan simpan favorit diberikan? | Komponen tidak punya alur konsisten |
| OD-07 | Syarat komentar/evaluasi | UC07 dapat komentar setelah login; UC20 evaluasi setelah membeli | **Confirmed distinction**, perlu finalisasi UI penempatannya | Tidak sesuai kelayakan pengguna |
| OD-08 | Data agenda dan berita | UC25 ada kalender/detail; data publik belum diserahkan di sumber ini | **Terbuka:** konten demo apa yang disetujui? | Berita/jadwal resmi fiktif |
| OD-09 | Profil | UC03 menyebut foto/alamat, registrasi menyebut nomor HP; skema account tidak identik | **Validasi field** sebelum desain final | Form berisi data yang tidak tersimpan |
| OD-10 | Chatbot | UC26 menetapkan perilaku; backend/model belum diverifikasi | **Konsep UI**, bukan klaim chatbot berfungsi | Klaim kemampuan palsu |
| OD-11 | Rating agregat | UC20 mendeskripsikan evaluasi penerbit | **Perlu data** sebelum menampilkan angka rating | Social proof palsu |
| OD-12 | Pengingat bayar | UC14 mencantumkan pengingat sekali setelah 1 jam | **Validasi implementasi dan channel notifikasi** | Membuat janji notifikasi yang tidak berjalan |
| OD-13 | Status pembayaran yang berulang | Skenario pembatalan dan retry butuh aturan order/cart | **Validasi logika** dengan tim implementasi | Buku hilang/terduplikasi di cart |
| OD-14 | Penamaan screen dan route | Dokumen proses bukan route map implementasi | **Validasi terhadap branch aktif** | Link prototype yang misleading |

---

# 14. Acceptance criteria tingkat produk

Sebuah prototipe pembeli dinyatakan **siap untuk review desain** (bukan siap produksi) bila:

1. Semua frame P0 tersedia dan terhubung secara konseptual; frame P1/P2 dibuat sesuai scope serta keputusan terbuka yang telah diberi batas.
2. Alur `katalog → detail → keranjang → checkout → pembayaran → perpustakaan → reader` dapat dipahami tanpa penjelasan teknis.
3. Pembeli yang belum berhak **tidak** diperlihatkan akses reader penuh sebagai flow yang berhasil.
4. Dokumen invoice dapat dibedakan jelas dari berkas e-book yang tidak dapat diunduh.
5. Library membedakan empat kelompok sesuai UC23; histori dibaca dan wishlist tidak tertukar.
6. Detail buku, produk, dan harga konsisten dengan 7 fixture demo; tak ada rating/promo/jumlah buku palsu.
7. State dasar tersedia untuk auth, pencarian, katalog, cart, checkout, payment, order, library, reader, event.
8. Agenda/komunitas ada sesuai kebutuhan namun detail yang tidak terspesifikasi tidak dikarang.
9. Desktop/mobile dibaca dengan nyaman, navigasi tidak berantakan, fokus input/tombol cukup jelas.
10. Setiap elemen visual punya fungsi; tidak ada badge/pill/dot AI-slop dekoratif, emoji acak, atau copy teknis sebagai headline produk.
11. Aset penting berasal dari repo atau memiliki sumber/lisensi yang dicatat.
12. Reviewer dapat menunjukkan apa yang **sudah didesain**, apa yang **sekadar simulasi**, dan apa yang **masih butuh keputusan bisnis**.

**Tidak dapat dijamin oleh desain Stitch:** keamanan PDF, sinkronisasi webhook, validitas pembayaran produksi, role authorization, performa DB, dan tersimpannya progres baca. Hal-hal ini memerlukan pengembangan dan pengujian terpisah.

---

# 15. Rencana kerja desain di Google Stitch

**Tujuan:** Menghindari proses sebelumnya, yaitu memberikan banyak file tanpa memisahkan requirement dan visual reference, lalu mengulang puluhan frame yang salah.

## Tahap A — Persiapan konteks

1. Muat PRD ini sebagai konteks produk (jika upload Markdown tidak didukung oleh UI Stitch yang dipakai, masukkan bagian relevan sebagai teks).
2. Buat/sertakan `DESIGN.md` khusus IKAPI yang berbeda dari dokumen Notion dan measurement Midtrans.
3. Sertakan screenshot bookstore terpilih dari `page-ref` dan 1–2 contoh desain yang sudah disetujui.
4. Sertakan hanya aset yang relevan dengan halaman yang akan dibuat; jangan membebani setiap screen dengan seluruh ilustrasi 3D.
5. Instruksikan Stitch untuk **tidak menganggap dokumen use case, ERD atau BPMN sebagai inspirasi visual**.

## Tahap B — Validasi arah visual

Desain satu screen **katalog** dan satu screen **detail buku** desktop + mobile terlebih dahulu, karena keduanya menunjukkan kualitas cover, tipografi, pencarian, grid dan CTA. Evaluasi terhadap referensi: artwork, komposisi, hierarki, no slop, copy. Bila gagal, perbaiki design contract/asset selection sebelum membuat lebih banyak screen.

## Tahap C — Lengkapi flow inti

Rancang auth dan cart/checkout/status/order, lalu perpustakaan dan web reader dengan state. Gunakan komponen yang sudah disepakati; jangan membuat bahasa desain baru per halaman.

## Tahap D — Fitur pendukung

Rancang evaluasi, agenda/berita, komunitas dalam batas keputusan terbuka, chatbot dan recently-viewed. Jangan menjadikan fitur belum jelas sebagai halaman penuh yang pura-pura final.

## Tahap E — Review lintas layar

Audit navigation paths, state, data simulasi, responsive, lisensi aset, konsistensi visual, wording, dan kesesuaian use case. Catat coverage per screen ID dan UC ID. Jangan menyebut "interaktif" jika hanya statis; periksa prototype links yang benar-benar terbentuk.

---

# 16. Matriks traceability use case pembeli 01–27

| UC | Use case sumber | FR terkait | Screen |
|---|---|---|---|
| 01 | Registrasi akun | FR-A01 | S03 |
| 02 | Login | FR-A02 | S02 |
| 03 | Mengelola profil | FR-A03 | S05 |
| 04 | Melihat katalog | FR-C01 | S01, S06 |
| 05 | Mencari buku | FR-C02 | S07 |
| 06 | Melihat detail buku | FR-C04 | S08 |
| 07 | Komentar & ulasan | FR-B02 | S08, S16 |
| 08 | Preview buku | FR-B01 | S09 |
| 09 | Tambah ke keranjang | FR-K01 | S08, S10 |
| 10 | Mengelola keranjang | FR-K02 | S10 |
| 11 | Membuat order | FR-K03 | S11 |
| 12 | Memilih metode pembayaran | FR-P01 | S11, S12 |
| 13 | Memproses pembayaran Midtrans | FR-P03, FR-P05 | S12 |
| 14 | Total pembayaran & batas waktu | FR-P02, FR-P06 | S11, S12 |
| 15 | Status pembayaran | FR-P04 | S12, S13 |
| 16 | Status pesanan digital | FR-P05 | S12, S13 |
| 17 | Riwayat pembelian | FR-O01, FR-O02 | S13 |
| 18 | Membaca e-book | FR-L03, FR-L04 | S14, S15 |
| 19 | Bookmark | FR-L05 | S15 |
| 20 | Evaluasi setelah pembelian | FR-R01–03 | S16 |
| 21 | Filter kategori | FR-C03 | S06, S07 |
| 22 | Unduh invoice pembelian | FR-O03 | S13 |
| 23 | Perpustakaan pribadi | FR-L01 | S14 |
| 24 | Cari buku di perpustakaan | FR-L02 | S14 |
| 25 | Agenda event & berita | FR-E01, FR-E02 | S17 |
| 26 | Chatbot bantuan/rekomendasi | FR-H01–03 | S19 |
| 27 | Riwayat buku terakhir dilihat | FR-C05 | S20, S01/S06 jika relevan |

Fitur **Komunitas** berasal dari diagram use case dan model data, tetapi belum mempunyai uraian skenario rinci setara UC01–27. Karena itu ia tetap tercakup secara prinsip dalam S18, **dengan scope rinci belum final**.

---

# 17. Lampiran: fixture katalog yang telah teridentifikasi

Sumber: `docs/design/assets/assets.json` pada branch `feature/breeze-auth-scaffold` yang telah diperiksa. Harga **hanya untuk simulasi prototipe**.

| ID | Judul | Penulis | Kategori fixture | Harga simulasi |
|---|---|---|---|---:|
| B01 | Pride and Prejudice | Jane Austen | Sastra | Rp 45.000 |
| B02 | Frankenstein | Mary Shelley | Sastra | Rp 39.000 |
| B03 | The Adventures of Sherlock Holmes | Arthur Conan Doyle | Sastra | Rp 59.000 |
| B04 | Flatland | Edwin A. Abbott | Pendidikan | Rp 35.000 |
| B05 | The Book of Tea | Okakura Kakuzō | Budaya | Rp 29.000 |
| B06 | The Art of War | Sun Tzu | Budaya | Rp 32.000 |
| B07 | The Theory of the Leisure Class | Thorstein Veblen | Bisnis | Rp 49.000 |

Semua fixture di atas tercatat bersumber dari Standard Ebooks dan berstatus **bukan inventaris IKAPI**. Harga, penerbit dan atribusi artwork harus dibaca langsung dari manifest terbaru sebelum dipakai ulang. Jangan menciptakan sinopsis, sample PDF, rating, stok, atau review jika data tersebut belum tersedia.

---

# 18. Definition of Done untuk dokumen PRD ini

- [x] Mengacu pada sumber BPMN AS-IS, BPMN TO-BE, USE CASE, skenario UC01–27, ERD, skema relasi, dan proposal.
- [x] Mengakomodasi keputusan terbaru pemilik produk.
- [x] Memetakan halaman pembeli dan state inti.
- [x] Membedakan requirement confirmed dengan risiko/open decision.
- [x] Menyertakan arahan referensi dan pencarian aset untuk handoff Stitch.
- [x] Memisahkan invoice yang boleh diunduh dari e-book yang tidak boleh diunduh.
- [x] Tidak mengklaim fungsi Stitch/prototype sama dengan aplikasi yang telah selesai.
- [ ] Konfirmasi keputusan terbuka (terutama komunitas dan jumlah lisensi per item).
- [ ] Kunci `DESIGN.md` proyek yang terpisah setelah contoh screen disetujui.
- [ ] Validasi screen list dan interaksi bersama stakeholder IKAPI sebelum implementasi produksi.

**Akhir dokumen PRD — fokus sisi pembeli/user.**
