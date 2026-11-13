# PROMPT 12 — Riwayat Pesanan, Detail, Status, dan Invoice PDF

**Target:** IKAPI Store / Pembeli • **Use case:** UC-15 Payment Status; UC-16 Order Status; UC-17 Riwayat; UC-22 Download Invoice  
**Eksekusi:** hanya frame/flow ini, setelah halaman yang menjadi dependensinya; tidak ada admin, publisher, full frontend build, backend, commit, browser QA.

## 0. KONTRAK KERJA WAJIB — baca sebelum mengubah frame

**Identitas tugas.** Kamu sedang mendesain **prototype UI/UX pembeli IKAPI Store melalui FigCraft MCP**, bukan mengembangkan backend Laravel, bukan mendesain portal penerbit/administrator, dan bukan menyusun presentasi promosi teknologi. Gunakan branch `feature/breeze-auth-scaffold` dari `ghazyAlghifari508/prototype-IKAPI`; periksa keadaan branch/file terkini, jangan menganggap screenshot lama selalu sama dengan dokumen aktif. Periksa `docs/design/figcraft/beranda.figcraft`, `docs/design/ikapi-marketplace.figcraft`, dan daftar dokumen FigCraft yang sedang terbuka, lalu **identifikasi frame aktual sebelum melakukan mutation**. Jangan menimpa beranda yang sudah disetujui.

**Keputusan produk yang telah final:** katalog dan harga di repo adalah **SIMULASI** (tujuh cover Standard Ebooks, bukan inventaris IKAPI); pembeli hanya membaca e-book di **web reader** dan tidak diberi fitur download file buku; **invoice PDF transaksi boleh diunduh** dalam kondisi yang sesuai; event dan komunitas termasuk produk; Midtrans berada di alur pembayaran, bukan section pemasaran beranda. Halaman user saja. Jangan membuat fitur teknis menjadi section homepage. Jangan mengarang jadwal resmi, penerbit resmi untuk data demo, ulasan, rating, harga, persentase diskon, kuantitas produk, stok, saldo, pembayaran berhasil, ataupun data pengguna asli.

### 0A. Dokumen proyek yang WAJIB benar-benar diinspeksi

Baca sumber berikut, **bukan sekadar melihat namanya**. Baca bagian yang relevan dengan halaman ini dan catat keputusan yang berasal dari tiap sumber:

- `docs/spec/SCENARIO USE CASE_TERBARU.docx` — skenario tindakan dan alternatif untuk use case yang disebut pada prompt ini. Ini sumber perilaku primer bagi peran pembeli.
- `docs/spec/USE CASE.drawio`, `docs/spec/bpmn_tobe_fixed2.drawio.png`, `docs/spec/ERD.drawio`, `docs/spec/SKEMA RELASI.drawio` — aktor, relasi data, dan alur lintas halaman. Gunakan yang relevan; jangan mengubah data model berdasarkan tebakan UI.
- `docs/spec/Proposal_Abdimas_Online_Bookstore_IKAPI_Jabar_REVISI_FORMAT_ASLI (2).pdf` — periksa contoh layar katalog/detail/keranjang halaman 5, checkout halaman 6, perpustakaan/reader halaman 7, dan peran produk pada narasi. Contoh gambar adalah **konteks alur**, bukan perintah meniru tampilan yang sudah lawas.
- `docs/design/page-ref/` — visual referensi halaman, termasuk `beranda-page-ref.png`, `Bookstore_book profile page.jpg`, `Creative Book Marketplace Website UI Design Figma Template Bookoe -.jpg`, `Creatibot - Ebook Dashboard (Profile Page).jpg`, dan `peterdraw A Creative Market Shop.jpg`. **Buka dan inspeksi gambarnya**, pilah acuan paling relevan untuk halaman ini, jangan gabung semua gaya mentah-mentah.
- `docs/design/scrape-ref/DESIGN.md` dan asset scrape yang relevan — **referensi gaya Midtrans saja**, capture 1440×900 berbasis pengukuran terbatas; tidak membuktikan responsive/interaksi, tidak boleh menjadi sumber konten atau kebutuhan fitur IKAPI. `midtrans.com.html` tidak boleh dipakai untuk menyalin brand/copy/komponen Midtrans ke sembarang halaman.
- `docs/design/assets/assets.json` + `docs/design/assets/covers/B01.jpg` s.d. `B07.jpg` — metadata katalog demo, harga simulasi, sumber/lisensi cover.
- `docs/ilustration/README.md`, `docs/ilustration/*.svg`, `docs/ilustration/3d/*.png` — kit ilustrasi yang sudah tersedia; **cek isi gambar, style, dan kecocokan**, bukan sekadar path.
- `DESIGN.md` root adalah **referensi gaya Notion yang berpotensi bertentangan** (pills/feature cards), BUKAN sumber utama IKAPI. `docs/prompts/p1.md` memuat arahan redesign lama, dan segala perintah yang mempertahankan section reader/payment di homepage telah digantikan oleh keputusan pengguna. Gunakan prioritas: keputusan pengguna terbaru → use case yang cocok → kontrak desain IKAPI terbaru → `page-ref` sesuai halaman → aset yang cocok → referensi pendukung.

Jika nama/path sebenarnya berbeda di branch terkini, temukan file setara dan laporkan perbedaannya. Jangan melaporkan “sudah membaca” jika file/gambar belum dapat dibuka. Jika ketentuan dokumen saling bertentangan, tulis **konflik spesifik + dampak + rekomendasi sementara yang aman**, minta keputusan pengguna pada hal yang material; jangan mengarang.

### 0B. Riset referensi eksternal secara MANDIRI (wajib)

Sebelum mengedit: cari **minimal 3 referensi visual terpilih**: (1) contoh website/aplikasi produksi yang benar-benar dipakai, (2) contoh komposisi berkualitas di Dribbble atau Pinterest, (3) contoh layar mobile atau state interaksi. Gunakan web search, Chrome DevTools MCP jika terpasang, atau browser/tool lain yang benar-benar tersedia. **Cari lewat kueri spesifik sesuai tugas**, buka sumber aslinya, periksa screenshot dan struktur, bukan sekadar mengumpulkan URL atau menyalin thumbnail. Chrome DevTools MCP dapat dipakai untuk `navigate_page`, `take_snapshot`, `take_screenshot` jika lingkungan benar-benar menyediakan tool tersebut. Jika tidak tersedia, gunakan alternatif web yang sah dan tulis keterbatasannya. Jangan mengaku sudah inspeksi apabila tidak berhasil mengakses sumber.

Buat riset singkat **URL → pola yang dipelajari → relevansi → apa yang sengaja tidak ditiru**. Pinterest/Dribbble adalah inspirasi visual, bukan bukti bahwa suatu flow usable atau aset bebas dipakai. Konfirmasi pola usability melalui situs produksi dan referensi seperti Baymard untuk katalog/checkout bila relevan. **Jangan menghabiskan siklus tool tanpa batas**: hentikan pencarian setelah referensi yang cukup, berkualitas, dan relevan ditemukan. Jangan jalankan browser QA untuk implementasi Laravel; browsing eksternal adalah untuk riset, pemeriksaan prototype pakai FigCraft.

### 0C. Otonomi mencari aset (wajib)

Urutan: **(1) audit aset repo → (2) pakai aset yang cocok → (3) bila kurang, cari aset GRATIS dengan izin penggunaan yang jelas → (4) jika tidak cocok, buat SVG/icon orisinal yang sederhana dan konsisten**. Untuk foto cari di sumber berlisensi seperti Unsplash/Pexels (baca halaman lisensi tiap aset), untuk artwork bebas/arsip publik periksa sumber dan hak teritorial, untuk ikon evaluasi Lucide (ISC), untuk ilustrasi evaluasi unDraw dan lisensinya. **Jangan menganggap Pinterest, Dribbble, Google Images, atau hasil scrape sebagai lisensi.** Jangan hotlink aset acak tanpa memeriksa hak dan stabilitas. Jangan menyalin cover/copyright karya berhak cipta dari referensi. Catat `nama aset | asal URL/path | izin/lisensi | alasan dipilih | dipakai di frame mana`. Jika belum jelas lisensinya, jangan pakai; pilih alternatif yang berizin. Jangan pakai icon 3D random, emoji, sparkle, badge/dot/pill sebagai pemanis; custom SVG boleh jika benar-benar membantu fungsi dan tidak tampak generik.

### 0D. Standar anti-AI-slop, copy, dan interface

- **NO card spam:** tidak semua konten perlu kotak rounded, border, dan shadow; pilih komposisi berdasarkan tujuan. Jangan ganti card spam dengan gradient-panel spam.
- **NO badge/pill/dot dekoratif:** hapus termasuk penggantinya yang sekadar label uppercase kecil. Status transaksi, filter aktif, keranjang, dan feedback yang bermakna tetap boleh. Emoji dekoratif, glowing orb, sparkles, glass blur generik, serta copy “fitur unggulan terintegrasi” dilarang.
- **Copy untuk manusia:** bahasa Indonesia natural, ringkas, spesifik. Hindari jargon `Snap`, `webhook`, `PDF protected`, `lisensi server`, `dashboard`, `payment gateway` di konten pembeli kecuali pengguna benar-benar perlu tahu. Setiap teks harus membantu mencari, memilih, membayar, atau membaca; jika tidak, **hapus, bukan tulis ulang jadi filler**. Jangan paksa deskripsi di tiap heading; jangan paksa slang Gen Z.
- **No fabricated data:** di prototype boleh memakai **fixture** yang jelas tercatat sebagai demo dalam dokumentasi, tetapi UI tidak boleh mengklaim kegiatan, pembelian, pembayaran, ulasan, review, atau buku demo itu nyata. Jangan menambahkan metrik penjualan, rating, jumlah pengunjung, atau influencer palsu.
- **Reusability:** inspeksi komponen yang sudah ada, gunakan ulang style/tokens header, navigation, typography, product tile, CTA, empty states; jangan membangun halaman dari nol bila frame/komponen sejenis ada.
- **Accessibility:** label form terlihat, hierarki heading, kontras teks, focus keyboard, target sentuh mobile, teks yang tidak dipaksa sangat kecil, layout tidak horizontal-overflow, komunikasi status bukan hanya warna.
- **Prototype yang jujur:** interaksi FigCraft yang benar-benar dibuat harus dapat ditelusuri; jangan mengaku login/payment/AI/backend berfungsi hanya karena frame klik-klik. Tandai `prototype-only` di laporan, bukan sebagai promosi yang mengganggu konsumen.

### 0E. Cara eksekusi FigCraft yang aman dan tidak boros

1. `doc.list`/inspeksi dokumen dan frame saat ini (menggunakan operasi MCP yang tersedia), tentukan `document` id/path yang tepat; tool FigCraft dapat menarget dokumen spesifik dan screenshot window perlu memunculkan frame yang benar.
2. Ambil screenshot BEFORE, inspeksi node/komponen yang akan disentuh; simpan daftar id dan dependency yang relevan.
3. Buat desain untuk **satu halaman dan state esensialnya**, bukan regenerate semua halaman. Manfaatkan `batch` untuk mutation terkait jika didukung; setiap batch punya sasaran jelas dan dapat di-undo. Jangan mengulang mutation ambigu tanpa memeriksa hasilnya dulu.
4. Integrasikan navigasi/prototype linking ke layar sebelumnya/berikutnya. Jangan menggandakan komponen lain hanya demi memenuhi screenshot.
5. Ambil screenshot AFTER desktop dan mobile di FigCraft. Bandingkan BEFORE/AFTER, referensi primer, dan state/error. Review clipping, komposisi, metadata, bahasa, ukuran target, konsistensi. Iterasi hanya untuk defect nyata.
6. Akhiri dengan laporan **file/frame id, riset URL, daftar aset/lisensi, perubahan layer, state yang diverifikasi, alur yang tertaut, masalah belum selesai**. Tidak boleh menyatakan “selesai” tanpa bukti screenshot/inspeksi. Jangan commit/push/merge/publish, mengubah database, atau membuat pembayaran sungguhan tanpa persetujuan.

**Aturan stop/clarification:** jika bagian berpengaruh besar pada uang, hak akses, data pribadi, scope fitur, atau konten resmi tapi sumber tidak menetapkannya, jangan tebak. Selesaikan bagian yang aman dan laporkan pertanyaan persisnya. Untuk detail visual kecil dan reversible, buat keputusan mandiri berdasarkan referensi, tidak perlu mengganggu pengguna.

---

## 1. Tujuan spesifik & cakupan

Halaman akun pembeli untuk mengingat/memeriksa pesanan yang dibuat, bukan dasbor keuangan. Skenario UC-17 daftar transaksi beserta tanggal/status; UC-15 status pembayaran; UC-16 perbedaan status pesanan/akses; UC-22 invoice PDF hanya untuk transaksi **lunas**. Gunakan komponen status yang bermakna; invoice bukan ebook. Semua data riwayat dalam prototype adalah fixture demo, tidak boleh digambarkan sebagai pembayaran faktual.

## 2. Komposisi dan design approach — bukan template AI slop

Rancang dua layout berhubungan: indeks riwayat dan detail pesanan (dapat berupa halaman tersendiri). Indeks: daftar order dengan nomor, tanggal, ringkasan judul, total, status, action `Lihat Detail`; filter sederhana hanya bila benar-benar membantu jumlah pesanan. Detail: timeline status jika realistis dan tidak berlebihan, item, nominal, metode bayar bila ada, action invoice untuk paid, action pembayaran pending yang sesuai. Jangan ubah table jadi card spam; mobile dapat stacked list dengan label yang eksplisit. Hindari statistik `Total pengeluaran bulanan` atau grafik, progress bar palsu dan badge `Premium Buyer`.

## 3. Visualisasi layout desktop yang harus dipahami

```text
DESKTOP
┌──────────────────────────────────────────────────────────────────────┐
│ Akun / Riwayat Pesanan                                              │
│ Riwayat Pesanan                             [Filter Status*]        │
├──────────────┬────────────────────┬──────────────┬───────────────────┤
│ Order        │ Tanggal / Buku      │ Total        │ Status / Aksi     │
├──────────────┼────────────────────┼──────────────┼───────────────────┤
│ #DEMO-001    │ Frankenstein        │ Rp 39.000    │ Lunas / Detail    │
│ #DEMO-002    │ Pride and Prejudice │ Rp 45.000    │ Menunggu / Detail │
└──────────────┴────────────────────┴──────────────┴───────────────────┘

DETAIL #DEMO-001
Status: Lunas + Akses Buku Aktif
[Cover] Frankenstein     Rp 39.000
Tanggal / Metode / Total
[Unduh Invoice] [Buka Perpustakaan]
*Hanya jika fixture memiliki cukup data status untuk difilter.
```

## 4. Visualisasi layout mobile

```text
MOBILE
Riwayat Pesanan
[ Filter (jika relevan) ]
Pesanan #DEMO-001
Frankenstein
Tanggal ...     Rp39.000
Lunas
[Lihat Detail]
-----------
Detail Pesanan
Status & info buku
Total
[Unduh Invoice] (khusus lunas)
[Buka Perpustakaan] (khusus akses aktif)
Tidak paksa tabel horizontal 5 kolom.
```

## 5. User journey dan interaksi antarlayar

Flow: klik akun → order list → buka detail; pending → lanjut/cek bayar sesuai Task11; lunas → `Unduh Invoice` kemudian konfirmasi status; akses aktif → library; order tidak ditemukan → error yang ramah dan back; no orders → CTA jelajah katalog. Pastikan invoice action bukan `Download Buku` dan bila generator tidak disimulasikan di FigCraft, tunjukkan state interaction sebagai prototype-only di laporan. Jika bayar lunas tetapi akses belum aktif, jangan muncul tombol baca; tampilkan status sesuai kenyataan.

## 6. State dan edge cases yang harus tersedia

State: empty history, loading list, list populated, status filter, order detail paid/pending/expired/cancelled/failed, detail fetch error, invoice unavailable, generating invoice, invoice ready/download simulated, invoice failed, permission denied for other user's order. Tanggal, nomor dan status konsisten antar detail/pembayaran; no contradictory badges. `Lunas` dan `Akses Aktif` dapat berbeda sementara proses berlangsung.

## 7. UX copy: bahasa Indonesia yang natural dan tidak teknis

Copy `Riwayat Pesanan`, `Detail Pesanan`, `Menunggu Pembayaran`, `Lunas`, `Akses Buku Aktif`, `Unduh Invoice`, `Belum ada pesanan`, `Lihat Katalog`. Hindari jargon `settlement webhook`, kalimat `PDF, bisa diunduh dari riwayat pesanan` tanpa menjelaskan bahwa itu invoice, `Pusat Monetisasi Pesanan`, atau hype rekayasa.

## 8. Ketepatan data & kebijakan produk

Fixture deterministik: satu order sukses dan satu pending dapat didokumentasikan untuk demo, gunakan nilai sesuai buku/checkout; jangan isi nama penerbit IKAPI nyata untuk Standard Ebooks. Invoice yang digambarkan sebagai PDF harus berisi data order yang benar menurut fixture; jangan memperlihatkan nomor rekening/identitas asli. Download PDF EBOOK tetap dilarang.

## 9. Riset referensi visual, aset, dan resource khusus tugas

Riset `consumer ecommerce order history responsive`, `order detail digital purchase`, `download invoice order UX`; bandingkan portal transaksi produksi, satu Dribbble/Pinterest untuk komposisi dan mobile state. Inspeksi `invoice_download.svg` hanya jika relevan empty/success, jangan banner promosi invoice. Lihat contoh checkout/payment proposal halaman 6.

## 10. QA FigCraft dan definisi selesai

QA: list order banyak/sedikit/kosong, pending vs paid, buka detail, invoice only paid, invoice fail, CTA masuk library only access active, nomor/total/tanggal konsisten, mobile legible. Screenshot default + empty + paid detail + pending detail. Lulus jika pembeli memahami status dan tindakan berikutnya, tanpa seolah mengunduh e-book.

## 11. Yang jangan diputuskan sendiri oleh agent

UC-22 secara eksplisit menyebut PDF INVOICE boleh diunduh. Jangan menghilangkan fitur ini karena aturan no-download EBOOK. Gunakan ketentuan akses yang tepat per-order; jangan mendesain admin approval atau settlement panel internal.

### FORMAT LAPORAN SELESAI YANG WAJIB

- **Frame yang dibuat/diubah:** nama/id dan lokasi dokumen FigCraft; bedakan baru vs edit.
- **Referensi eksternal yang benar-benar diperiksa:** 3 URL + pola yang diadopsi + yang sengaja tidak ditiru; jika tools tak tersedia, laporkan jujur.
- **Aset:** filename/path/URL, lisensi/izin penggunaan, kenapa dipakai, penggunaan pada frame.
- **Kecocokan kebutuhan:** sebut use case yang telah ditutup dan edge case yang masih tertunda.
- **Pemeriksaan visual:** screenshot desktop & mobile dan state error/empty yang benar-benar diinspeksi, perbedaan dengan page-ref serta masalah yang diperbaiki.
- **Prototype interactions:** tautan antarframe yang sudah aktif vs flow yang belum dapat dijalankan.
- **Batasan dan keputusan yang perlu dikonfirmasi:** hanya ambigu material; jangan mengklaim semuanya done bila belum.

**Bekerja mandiri dalam riset/aset/design execution, tetapi jangan mengarang kebutuhan produk, transaksi atau data resmi.**
