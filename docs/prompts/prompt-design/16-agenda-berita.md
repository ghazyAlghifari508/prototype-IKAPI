# PROMPT 16 — Agenda Event, Kalender, Berita Literasi, dan Detail

**Target:** IKAPI Store / Pembeli • **Use case:** UC-25 event & news: kalender + list + detail, confirmed event real feature  
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

Ini bukan 3 card dekoratif berisi event rekaan. UC-25 secara eksplisit meminta **kalender event**, daftar ringkasan berita literasi, dan navigasi ke detail lengkap event/artikel. Event dan komunitas diperlukan dalam produk. Jangan memperlakukan semua informasi event sebagai berita dengan satu layout. Semua jadwal/publikasi resmi harus diverifikasi; jika hanya fixture, hindari copy yang membuat orang yakin event benar-benar akan berlangsung.

## 2. Komposisi dan design approach — bukan template AI slop

Rancang (A) indeks agenda yang menyediakan cara berpindah tanggal/bulan dan item event pada tanggal yang relevan, (B) indeks berita (bisa satu halaman dengan pembagian jelas), (C) detail acara berisi judul, jadwal, lokasi/format dan deskripsi sesuai data, (D) detail berita berisi tanggal/sumber dan isi yang disetujui. Hindari event RSVP/ticket sales kecuali telah jadi requirement; agenda bukan checkout tiket. Kalender harus usable, bukan grid 7x5 tanggal yang tidak terkait event. Gunakan poster/editorial media yang relevan, komposisi beragam, bukan triple text cards/badges pelangi.

## 3. Visualisasi layout desktop yang harus dipahami

```text
DESKTOP
┌─────────────────────────────────────────────────────────────────────┐
│ Agenda dan Kabar Literasi                         [Lihat Berita]    │
├────────────────────────────┬────────────────────────────────────────┤
│ Kalender Bulan X           │ Kegiatan Bulan Ini                      │
│ Su Mo Tu We Th Fr Sa       │ [Poster] Judul Kegiatan                │
│ .. .. .. .. .. .. ..       │ Tanggal / Lokasi jika data ada         │
│ pilih tanggal             │ [Lihat Detail]                          │
└────────────────────────────┴────────────────────────────────────────┘
│ Berita Literasi                                                      │
│ [Thumbnail] Judul artikel     [Thumbnail] Judul artikel              │
└─────────────────────────────────────────────────────────────────────┘
DETAIL ACARA: Judul → Waktu/Lokasi → Isi → Kembali ke Agenda
DETAIL BERITA: Judul → Metadata → Artikel → Kembali ke Berita
```

## 4. Visualisasi layout mobile

```text
MOBILE
Agenda dan Kabar Literasi
[ Pilih bulan ] [ Kalender/list view* ]
[ Tanggal terpilih ]
[Poster] Judul Event
Tanggal / lokasi
[Lihat Detail]

Berita Literasi
[Thumbnail] Judul Artikel
Tanggal
[Baca Artikel]
*Jika dua view memiliki alasan UX dan state; jangan bikin toggle dekoratif.
```

## 5. User journey dan interaksi antarlayar

Flow: navigation Agenda → kalender pada bulan aktif → pilih tanggal → lihat event relevan → detail event → kembali list dengan tanggal/bulan terpilih; Berita → pilih artikel → baca detail → back; empty month/day → clear empty; jika belum ada konten resmi, jangan buat event fiktif seolah diumumkan. Jika agenda/berita punya database terpisah, perhatikan keadaan no events tetapi news tersedia (dan sebaliknya). Event calendar clickable semantics dan waktu Indonesia harus konsisten dengan data source.

## 6. State dan edge cases yang harus tersedia

State: agenda upcoming real/approved fixture, selected date with events, date without events, month navigation, event detail available/missing, news list available/empty, article loading/error, hero image fallback, empty all; mobile calendar. No RSVP registration or countdown if not in UC25. No official false claims like Bandung Book Fair tanggal tertentu tanpa konfirmasi.

## 7. UX copy: bahasa Indonesia yang natural dan tidak teknis

Copy `Agenda dan Kabar Literasi`, `Kegiatan Bulan Ini`, `Berita Literasi`, `Lihat Detail`, `Baca Artikel`, `Belum ada agenda pada tanggal ini`, `Belum ada berita`, `Kembali ke Agenda`. Jangan `Contoh agenda untuk pratinjau prototipe. Jadwal resmi diumumkan...` sebagai deskripsi konsumen; status demo disimpan di dokumentasi. Jangan `Momen Literasi Luar Biasa` tagline cringe.

## 8. Ketepatan data & kebijakan produk

Konten fixture hanya dari sumber proyek atau owner-approved. Jangan mengambil poster dari acara sungguhan lalu mengganti tanggal/nama untuk membuat acara fiktif. Untuk media tanpa gambar, buat original poster komposisi tipografi yang dinyatakan demo di asset log dan jangan memberi kesan acara resmi. Jika artikel panjang tidak tersedia, jangan generate berita seolah pernyataan IKAPI.

## 9. Riset referensi visual, aset, dan resource khusus tugas

Riset `literary events calendar listing`, `cultural event details website`, `editorial news mobile layout`, contoh website agenda produksi + Pinterest/Dribbble + mobile state; periksa `community_reading.svg`, `3d_calender_event.png` hanya jika bermanfaat. Periksa `docs/spec` use case UC25 dan entitas event/berita agar metafora kalender benar. Jangan mengimpor Midtrans visual ke news.

## 10. QA FigCraft dan definisi selesai

QA: pilih tanggal berisi event, kosong, bulan berikut, buka/back detail, news list/detail, berita kosong, poster cropping, tanggal/jam readable mobile, kalender keyboard jika diwakili, no invented official schedule. Screenshot indeks desktop/mobile + detail + empty. Lulus bila kalender dan berita termasuk, bukan hanya tiga kartu teks.

## 11. Yang jangan diputuskan sendiri oleh agent

Nomor/tanggal acara di screenshot lama tidak membuktikan acara itu asli. Jangan menggunakan tanggal November/Desember 2026 tanpa verifikasi. Jika event resmi belum didapat, tampilkan empty yang kredibel dan desain fixture yang diberi status dokumentasi, tidak menampilkan klaim resmi.

### FORMAT LAPORAN SELESAI YANG WAJIB

- **Frame yang dibuat/diubah:** nama/id dan lokasi dokumen FigCraft; bedakan baru vs edit.
- **Referensi eksternal yang benar-benar diperiksa:** 3 URL + pola yang diadopsi + yang sengaja tidak ditiru; jika tools tak tersedia, laporkan jujur.
- **Aset:** filename/path/URL, lisensi/izin penggunaan, kenapa dipakai, penggunaan pada frame.
- **Kecocokan kebutuhan:** sebut use case yang telah ditutup dan edge case yang masih tertunda.
- **Pemeriksaan visual:** screenshot desktop & mobile dan state error/empty yang benar-benar diinspeksi, perbedaan dengan page-ref serta masalah yang diperbaiki.
- **Prototype interactions:** tautan antarframe yang sudah aktif vs flow yang belum dapat dijalankan.
- **Batasan dan keputusan yang perlu dikonfirmasi:** hanya ambigu material; jangan mengklaim semuanya done bila belum.

**Bekerja mandiri dalam riset/aset/design execution, tetapi jangan mengarang kebutuhan produk, transaksi atau data resmi.**
