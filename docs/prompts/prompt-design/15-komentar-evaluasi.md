# PROMPT 15 — Komentar Buku dan Evaluasi Setelah Pembelian

**Target:** IKAPI Store / Pembeli • **Use case:** UC-07 komentar dengan filter validasi; UC-20 evaluasi 4 indikator skala 1–5 setelah beli  
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

PENTING: ada **DUA FLOW BERBEDA**, jangan digabung begitu saja: UC-07 komentar di detail buku oleh user login dengan pemeriksaan kata kasar/spam; UC-20 evaluasi terstruktur setelah pembelian (empat indikator masing-masing rentang 1–5) disertai ulasan teks. Jika disatukan dalam satu panel visual, state dan eligibility tetap harus dibedakan. Jangan mengklaim rating buku yang belum punya evaluasi. Jangan membuat ulasan pelanggan palsu atau avatar palsu yang tampak autentik.

## 2. Komposisi dan design approach — bukan template AI slop

Area komentar terintegrasi pada detail buku; form ringkas label, textarea, validasi inline, daftar komentar, empty state. Evaluasi pascapembelian dapat berupa panel terpisah dalam detail buku milik/riwayat, bukan popup promosi di homepage. Setiap indikator 1–5 diberi label yang jelas dan control yang dapat dipilih; skala harus mudah dipahami, bukan empat glitter badges. Komentar yang gagal validasi tidak hilang dan kata bermasalah dapat ditandai jika memang didukung skenario. Status review pribadi tidak dicampur dengan data review agregat.

## 3. Visualisasi layout desktop yang harus dipahami

```text
DESKTOP — KOMENTAR
┌──────────────────────────────────────────────────────────────────────┐
│ Komentar Pembaca                                                     │
│ [Tulis komentar tentang buku ini.................................] │
│ [Kirim Komentar]                                                     │
│                                                                      │
│ Nama Penulis Komentar*                                               │
│ Isi komentar yang memang ada dalam fixture...                       │
└──────────────────────────────────────────────────────────────────────┘
*Jika data demonstrasi, tandai secara internal, jangan klaim komentar real.

EVALUASI PEMBELI
Kesesuaian ekspektasi      (1) (2) (3) (4) (5)
Kebermanfaatan isi        (1) (2) (3) (4) (5)
Kesesuaian harga          (1) (2) (3) (4) (5)
Peluang membeli lagi      (1) (2) (3) (4) (5)
Ulasan                   [________________]
[Kirim Evaluasi & Ulasan]
```

## 4. Visualisasi layout mobile

```text
MOBILE
Komentar Pembaca
[ Tulis komentar... ]
[ Kirim Komentar ]

Evaluasi Buku
Kesesuaian ekspektasi
1   2   3   4   5
Kebermanfaatan isi
1   2   3   4   5
... dan seterusnya
[Ulasan...............]
[Kirim Evaluasi & Ulasan]
Nilai radio harus dapat disentuh, tidak terlalu kecil dan tidak mengandalkan warna saja.
```

## 5. User journey dan interaksi antarlayar

Flow komentar: user login → input → submit valid → tersimpan/ditampilkan; jika kosong/spasi/simbol atau kata tidak pantas → error inline, fokus dan isi dipertahankan, koreksi, retry. Jika guest klik komentar, minta login dan return ke detail. Flow evaluasi: hanya completed purchase → isi 4 aspek (1..5) + ulasan → validate semua → submit → state sukses; incomplete → highlight yang kurang; belum pembeli → evaluasi tidak ditawarkan sebagai aksi aktif. Jangan melarang komentar biasa hanya karena belum membeli bila UC-07 mengizinkan user login.

## 6. State dan edge cases yang harus tersedia

State: no comments, comments list, comment composing, invalid blank, invalid content, filter rejected, submit failure, success; evaluation not eligible, eligible empty, partial, all filled, pending, success, failure; no rating aggregate until actual data. Prevent double submit, meaningful feedback rather than generic confetti.

## 7. UX copy: bahasa Indonesia yang natural dan tidak teknis

Copy `Komentar Pembaca`, `Tulis Komentar`, `Kirim Komentar`, `Perbaiki komentar sebelum mengirim`, `Evaluasi Buku`, `Nilai pengalaman membaca`, empat label sesuai skenario, `Kirim Evaluasi & Ulasan`, `Lengkapi semua penilaian`. Jangan `Smart Content Filter`, `AI Moderator`, `Review Terverifikasi` kecuali status benar-benar didukung; hindari emoticon dan lencana reviewer.

## 8. Ketepatan data & kebijakan produk

Fixture: gunakan komentar dan skor contoh hanya jika ada data fixture yang jelas disetujui; jangan membuat lima avatar/ulasan untuk mempercantik. Jika belum ada, empty state `Belum ada komentar` cukup, form tersedia jika eligible. Rating agregat penerbit belum bisa dihitung tanpa input nyata; jangan tampilkan 4.9 stars dan angka ulasan asal.

## 9. Riset referensi visual, aset, dan resource khusus tugas

Riset `book review form ecommerce`, `accessible rating survey 1-5`, `community content moderation feedback`, produk nyata dan 1 Dribbble/Pinterest. Periksa UC07/UC20 langsung dari docx, ERD relasi ulasan; gunakan no stock hero or badges. Fokus form patterns dengan real labels, errors dan keyboard navigation.

## 10. QA FigCraft dan definisi selesai

QA: guest komentar login; user login bisa komentar tanpa purchase; blank/spam validation; rejected retains input; success no fake likes; post-purchase evaluation 4 pertanyaan 1..5; missing one error; after submit success; user belum beli tidak bisa submit evaluasi; mobile tap targets. Screenshot empat family state. Lulus jika alur terpisah dan bukan rating system palsu.

## 11. Yang jangan diputuskan sendiri oleh agent

Sumber tidak membuktikan model penyaringan komentar otomatis yang dipakai, frekuensi ulasan, atau akses edit/hapus; jangan klaim AI-powered moderation atau invent controls. Jika status filtered perlu disimulasikan, tandai fixture dan jangan menyebut penyensoran otomatis sebagai fitur production.

### FORMAT LAPORAN SELESAI YANG WAJIB

- **Frame yang dibuat/diubah:** nama/id dan lokasi dokumen FigCraft; bedakan baru vs edit.
- **Referensi eksternal yang benar-benar diperiksa:** 3 URL + pola yang diadopsi + yang sengaja tidak ditiru; jika tools tak tersedia, laporkan jujur.
- **Aset:** filename/path/URL, lisensi/izin penggunaan, kenapa dipakai, penggunaan pada frame.
- **Kecocokan kebutuhan:** sebut use case yang telah ditutup dan edge case yang masih tertunda.
- **Pemeriksaan visual:** screenshot desktop & mobile dan state error/empty yang benar-benar diinspeksi, perbedaan dengan page-ref serta masalah yang diperbaiki.
- **Prototype interactions:** tautan antarframe yang sudah aktif vs flow yang belum dapat dijalankan.
- **Batasan dan keputusan yang perlu dikonfirmasi:** hanya ambigu material; jangan mengklaim semuanya done bila belum.

**Bekerja mandiri dalam riset/aset/design execution, tetapi jangan mengarang kebutuhan produk, transaksi atau data resmi.**
