# Kontrak Identitas dan Autentikasi

Kontrak ini mencakup autentikasi pembeli UC-01/UC-02 yang diimplementasikan melalui Laravel Fortify.

## Administrator — UC-39 (Devina P1)

- Panel ID `admin`, dashboard `GET /admin`, login `GET /admin/login`, logout `POST /admin/logout`. Guard `web` dan `App\Models\User` tetap sama dengan pembeli/penerbit. Tidak ada tabel admin, guard baru, atau endpoint login React/API tambahan.
- `App\Filament\Auth\Login` memperluas login Filament 5; validasi kredensial, timebox, session regeneration, remember-me, serta throttle bawaan 5 percobaan per IP per menit tetap dikerjakan Filament. Password state dikosongkan setelah setiap submit, termasuk validasi gagal dan throttle. Error kredensial dan penolakan hak akses memakai pesan generik yang sama.
- Identifier hanya email; username belum tersedia. Sukses langsung menuju dashboard/intended destination framework tanpa modal konfirmasi. Penolakan tetap di form dengan error inline, sesuai tujuan skenario UC-39.
- `User::canAccessPanel()` tetap mensyaratkan panel `admin`, email terverifikasi, dan permission `access-admin-panel` pada guard `web`. Role bernama `admin` saja tidak memberikan akses; belum ada role administrator baku. Tidak ada bypass environment local.
- Seeder menyiapkan permission secara idempotent tanpa memberikan permission itu kepada user atau role mana pun. Role publik tetap `buyer` dan `publisher`. Akun demo existing tidak mendapat hak admin.
- Middleware `Authenticate` Filament mengevaluasi akses pada request protected; didaftarkan persistent agar pemeriksaan juga berlaku pada update Livewire. Logout bawaan mengakhiri autentikasi guard bersama, menginvalidasi sesi, dan mengganti token CSRF. Logout admin juga mengakhiri sesi pembeli/penerbit pada browser yang sama.
- Pencabutan melalui API Spatie (`revokePermissionTo`, `removeRole`, atau `revokePermissionTo` pada role) berlaku pada request berikutnya. Jika permission berasal dari role, mencabut grant langsung saja tidak mencabut grant role. Hindari SQL manual; bila terpaksa dilakukan, jalankan `php artisan permission:cache-reset` dan pastikan relasi user dimuat ulang.
- Branding panel menggunakan `IKAPI Jawa Barat` serta primary `#0075de` dari `DESIGN.md`. Layout responsif dan komponen aksesibel tetap bawaan Filament; widget informasi framework dihapus, dashboard hanya mempertahankan widget akun. Tidak ada statistik atau resource bisnis baru.

### Provisioning administrator oleh operator tepercaya

Jalankan hanya dari shell server/lokal yang aksesnya dibatasi kepada operator berwenang. Tidak ada provisioning otomatis saat login/deployment dan tidak ada kredensial admin default. Prosedur ini belum memberikan hak kepada akun nyata mana pun.

1. Jalankan migrasi yang sudah ditinjau pada environment tujuan. Untuk mendaftarkan permission tanpa menjalankan demo seeder, buka `php artisan tinker` dan jalankan:

    ```php
    \Spatie\Permission\Models\Permission::findOrCreate('access-admin-panel', 'web');
    ```

2. Pilih akun existing yang identitas pemiliknya sudah dikonfirmasi. Jika perlu akun baru, gunakan `php artisan make:filament-user --panel=admin` secara interaktif. Masukkan password unik melalui prompt tersembunyi, jangan melalui opsi `--password`/shell history. Command Filament hanya membuat User; tidak memverifikasi email atau memberikan permission. Jangan percaya pesan sukses command sebagai bukti hak akses panel.
3. Akun wajib menyelesaikan verifikasi email melalui alur Fortify existing. Jangan mengubah `email_verified_at` untuk mengatasi kegagalan login. Pada lingkungan tanpa pengiriman email yang berfungsi, provisioning belum lengkap sampai verifikasi sah tersedia.
4. Operator membuka `php artisan tinker`, mengganti placeholder dengan email akun yang telah disetujui, lalu memeriksa identitas sebelum pemberian izin:

    ```php
    $user = \App\Models\User::where('email', '<email-akun-disetujui>')->sole();
    $user->only(['id', 'name', 'email', 'email_verified_at']);
    // Lanjutkan hanya setelah operator mengonfirmasi identitas dan persetujuan.
    if (! $user->hasVerifiedEmail()) { throw new \RuntimeException('Email belum terverifikasi.'); }
    $permission = \Spatie\Permission\Models\Permission::findOrCreate('access-admin-panel', 'web');
    $user->givePermissionTo($permission);
    $user->fresh()->canAccessPanel(\Filament\Facades\Filament::getPanel('admin'));
    ```

    Pemberian izin idempotent, tidak mengganti password, role, atau status penerbit. Catat persetujuan dan identitas operator melalui prosedur operasional tim; fitur audit provisioning baru tidak ditambahkan di UC-39.

5. Verifikasi login `/admin/login`, buka dashboard, lalu logout. Untuk mencabut grant langsung, gunakan `$user->revokePermissionTo('access-admin-panel')`, lalu pastikan request protected berikutnya menghasilkan 403. Tinjau juga permission yang diwariskan lewat role.

### Kontrak untuk UC-40 dan resource administrator lain

Gunakan identitas server `Filament::auth()->id()`/`Filament::auth()->user()` untuk actor tindakan. Resource baru berada di panel existing dan tetap memerlukan policy/permission bisnis tersendiri; permission masuk panel bukan izin otomatis untuk seluruh operasi data. Jangan menerima actor ID, role, atau approval dari payload sebagai sumber otorisasi. UC-39 tidak menambahkan approval penerbit, pengelolaan akun, katalog, atau payout.

`tests/Feature/AdminAccessTest.php` mencakup halaman login, guest redirect, login/sesi/logout, input invalid, penolakan buyer/publisher, email belum terverifikasi, isolasi panel, revocation, throttle, dan seeder tanpa grant. Tes registrasi/profil existing mencakup penolakan manipulasi privilege dari request publik. Jalankan dengan PostgreSQL `ikapi_marketplace_test` terisolasi sesuai `phpunit.xml`, bukan database development/production.

### Hasil verifikasi Devina P1 — 12 November 2026

- Baseline audit: branch `devina`, HEAD `f08cea9`, working tree bersih. Tidak ditemukan `AGENTS.md` atau TODO implementasi admin. Fondasi aktual sudah mencakup registrasi/login pembeli dan penerbit, recovery password, serta profil. Dokumen pembagian PIC yang disebut prompt tidak tersedia di repository; scope mengikuti prompt Devina P1 dan skenario UC-39 pada DOCX. Diagram ERD/relasi awal memuat administrator sebagai entitas konseptual, tetapi implementasi mengikuti keputusan identitas tunggal pada dokumen stack/fondasi.
- PHP PATH masih XAMPP 8.2.12. Verifikasi menggunakan PHP 8.4.27 portable di `%TEMP%\ikapi-devina-p1-php84` dengan ekstensi yang diperlukan, tanpa mengubah XAMPP atau PATH permanen. `composer install --no-interaction` berhasil menggunakan runtime portable.
- PostgreSQL lokal port 5432 menolak koneksi tanpa password. Tes akhirnya menggunakan cluster sementara PostgreSQL 18.6 di `%TEMP%\ikapi-devina-p1-pg18`, loopback port 49839, database `ikapi_marketplace_test`, user `ikapi_test`; konfigurasi hanya melalui environment proses, `.env` tidak diubah. Cluster ini khusus tes dengan trust authentication lokal dan dihentikan setelah verifikasi.
- `php artisan test --filter=AdminAccess`: **15 lulus, 138 assertions**. Pengujian menemukan cache permission stale pada seeder `WithoutModelEvents`; invalidasi cache sebelum/sesudah setup memperbaiki pengulangan seeder.
- `php artisan test`: **98 lulus, 584 assertions**, termasuk autentikasi pembeli/penerbit, recovery password, verifikasi email, dan profil.
- Pint seluruh repository, PHPStan, `npm run check`, `npm run types:check`, `npm run build`, dan `git diff --check` lulus. `route:list --path=admin` mengonfirmasi tiga route panel/login/logout existing. Build memberi peringatan opsional `fontaine`; build tetap berhasil dan tidak ditambahkan dependency.
- QA visual desktop/mobile di browser belum dilakukan. Render halaman login dan alur auth diverifikasi melalui HTTP/Livewire tests; ini bukan bukti QA visual. Tidak ada akun administrator nyata dibuat atau dinaikkan privilege-nya; operator perlu mengikuti provisioning di atas pada environment tujuan. Koneksi PostgreSQL dan PHP permanen lokal masih perlu dikonfigurasi sebelum penggunaan harian.
- Implementasi terbatas pada UC-39; tidak ada commit, push, merge, atau deployment pada pekerjaan P1 ini.

## Persetujuan pendaftaran penerbit — UC-40 bagian A (Devina P2)

- Source of truth tetap `App\Models\PublisherRegistration` / `publisher_registrations`, satu permohonan per `User`. Registrasi existing memberi role `publisher` dengan status awal `pending`. Tidak ada tabel identitas penerbit kedua atau role `publisher_active`.
- Resource Filament `PublisherRegistrationResource` menyediakan daftar `/admin/publisher-registrations` dan detail `/{record}`. Menu **Pendaftaran Penerbit** menampilkan pencarian, filter status (default Menunggu), identitas, email, nomor IKAPI, tanggal, status, serta detail. Tidak ada create/edit/delete/bulk approval atau statistik bisnis.
- Permission baru `review-publisher-registrations` pada guard `web` wajib bersama email terverifikasi dan `access-admin-panel`. `PublisherRegistrationPolicy` menjaga list/detail/dokumen, sementara ability `decide` juga menolak review permohonan milik aktor sendiri. Aksi UI dan service sama-sama memeriksa otorisasi; service memuat ulang aktor dari database agar grant yang dicabut tidak tertutupi relasi lama.
- Seeder mendaftarkan permission tanpa assignment. Operator tepercaya dapat memberi grant kepada admin existing yang telah disetujui melalui Tinker: `$admin->givePermissionTo(\Spatie\Permission\Models\Permission::findOrCreate('review-publisher-registrations', 'web'));`. Ini tambahan terhadap prosedur provisioning admin UC-39, bukan grant otomatis kepada semua administrator.
- `ReviewPublisherRegistration::handle($actor, $registrationId, $status, $reason)` hanya mengizinkan `pending → approved` atau `pending → rejected`. Alasan rejected wajib, di-trim, maksimal 2000 karakter. Tidak ada approval ulang, pembatalan keputusan, atau resubmission. Status lain, termasuk `suspended`, tidak dapat ditetapkan melalui action ini.
- Service memakai transaksi dan `SELECT FOR UPDATE` pada permohonan, memeriksa status terbaru, lalu menyimpan status dan satu audit. Unique constraint pada `publisher_registration_reviews.publisher_registration_id` menjadi perlindungan tambahan terhadap keputusan ganda. Permohonan yang sudah diputuskan menghasilkan pesan untuk memuat ulang, tanpa audit/job baru.
- Model audit `PublisherRegistrationReview` menyimpan target, `actor_id`, `previous_status`, `new_status` (juga jenis tindakan), alasan penolakan, dan waktu. Audit tersedia pada relasi `$registration->review`, hanya dibaca melalui detail; tidak ada route mutasi audit. Foreign key restrict mempertahankan target/aktor: penghapusan user/permohonan yang sudah memiliki keputusan akan ditolak database. Bila penghapusan identitas diperlukan nanti, desain retensi/anonymization audit harus diputuskan terlebih dahulu.
- Dokumen pendaftaran tetap pada disk `local` privat. Endpoint `GET /admin/publisher-registrations/{registration}/document` memakai auth/verified dan policy review; respons attachment `private, no-store` serta `nosniff`. Path penyimpanan tidak diberikan sebagai URL publik dan penerbit lain tidak boleh mengunduh dokumen tersebut.

### Antrean pemberitahuan keputusan

`PublisherRegistrationDecided` adalah queued/encrypted notification berbahasa Indonesia. Approved berisi keputusan dan tautan `/publisher/login` dari `APP_URL`; rejected berisi alasan tanpa janji pengajuan ulang. Tujuan hanya email User pemilik permohonan. Login penerbit dan middleware existing tetap memeriksa role/status, dengan email verification tetap diperlukan untuk dashboard; approval tidak memverifikasi email atau mengubah role/permission.

Untuk membuat keputusan, audit, dan dispatch atomik, notification secara eksplisit memakai koneksi antrean `database` dengan `beforeCommit()`. Ini hanya memasukkan job dalam transaksi database aplikasi; **pengiriman email tidak terjadi sebelum commit**. PostgreSQL tidak memperlihatkan row job kepada worker/koneksi lain sampai transaksi commit. Jika insert job gagal, status dan audit ikut rollback. Service menolak konfigurasi database queue yang menunjuk koneksi berbeda; jangan mengganti koneksi ini ke Redis/SQS tanpa mendesain ulang transactional delivery.

Jalankan `php artisan queue:work database --tries=3` pada environment tujuan. Koneksi database queue harus menggunakan koneksi database aplikasi (`DB_QUEUE_CONNECTION` kosong atau sama dengan `DB_CONNECTION`); worker dan aplikasi harus memakai `APP_KEY` yang sama untuk payload terenkripsi. `MAIL_PUBLISHER_APPROVAL_MAILER` default `smtp`; atur credential SMTP sah, `MAIL_FROM_ADDRESS`, dan HTTPS `APP_URL`. Jangan gunakan mailer log untuk alasan penolakan yang bersifat privat.

SMTP error tidak membatalkan keputusan yang sudah commit. Job mencoba sampai 3 kali dengan backoff 60/300 detik dan memakai `failed_jobs` existing bila tetap gagal. Operator memeriksa `queue:failed` dan mengulang job tertentu dengan `queue:retry <uuid>` setelah memperbaiki SMTP. Satu keputusan hanya membuat satu job; transport SMTP/worker tetap bersifat at-least-once (crash setelah SMTP menerima pesan dapat menyebabkan pengiriman ulang), bukan jaminan exactly-once delivery ke inbox.

### Handoff P3 dan Dimas

Gunakan User dan relasi `publisherRegistration` yang sama untuk profil penerbit. Status approval menyatakan hasil pendaftaran, bukan status aktif akun umum. P3 perlu menetapkan kontrak active/suspended terpisah tanpa mengubah/menghapus audit keputusan atau memberi approval otomatis. Jangan membuat model identitas/login baru. P2 tidak menambahkan UI suspend, rekening, katalog, atau modul lain.

Untuk memverifikasi integrasi: buat permohonan melalui registrasi existing, login sebagai reviewer, setujui, lalu login sebagai penerbit dan buka dashboard. Pending/rejected tetap ditolak; approved tetapi email belum terverifikasi mengikuti alur verifikasi existing. Jangan memprovisikan akun nyata atau memberikan hak kepada user tanpa persetujuan operator.

### Hasil verifikasi P2 — 12 November 2026

- Baseline tetap branch `devina`, HEAD `f08cea9`, dengan perubahan P1 yang belum di-commit dipertahankan. Model registrasi/login penerbit existing diaudit bersama skenario UC-28/29/40, kontrak identitas, fondasi, stack, dan desain. Tidak ada policy/resource/audit approval existing sebelum P2.
- `PublisherApprovalTest`: **22 tes lulus, 125 assertions**, mencakup review UI, pencarian/filter, izin, dokumen privat, transisi, alasan, audit, rollback saat antrean gagal, visibilitas job sebelum commit, dan integrasi login penerbit setelah keputusan.
- `PublisherApprovalConcurrencyTest`: **1 tes lulus, 13 assertions**. Dua proses PHP dimulai saat row permohonan dikunci, lalu bersaing setelah lock dilepas. Hanya satu keputusan, audit, dan job yang commit. Job terenkripsi diproses worker nyata sesudah commit memakai mailer in-memory; bukan pengiriman SMTP eksternal.
- Regresi penuh: **121 tes lulus, 722 assertions**, termasuk P1 admin dan auth/profile pembeli/penerbit existing. Pint, PHPStan, formatter/linter frontend, TypeScript, build, route admin, dan diff check lulus. Build hanya memberi peringatan opsional fontaine yang sudah ada.
- Verifikasi memakai PHP 8.4.27 portable dan cluster PostgreSQL 18 sementara yang terisolasi pada port 49839, database `ikapi_marketplace_test`. Migration baru diuji pada database test; database harian pengguna dan `.env` tidak diubah. Tidak ada approval atau grant akun nyata yang dilakukan.
- Belum diverifikasi: QA visual browser desktop/mobile, SMTP/inbox nyata, serta provisioning reviewer pada environment harian. PHP PATH/koneksi PostgreSQL lokal masih perlu setup seperti catatan P1. Untuk penggunaan nyata, jalankan migration yang ditinjau, seed permission, beri grant reviewer secara sah, dan jalankan worker/SMTP sesuai prosedur di atas.
- P2 tidak mengerjakan active/suspended atau modul P3; tidak ada commit/push/merge/deploy.

## Keaktifan akun — UC-40 bagian B (Devina P3)

Penomoran belum selaras: prompt/pembagian PIC mengaitkan pekerjaan status akun dengan UC-41, sedangkan skenario DOCX menempatkannya pada UC-40. Hasil P3 ini **bukan penyelesaian UC-41 moderasi katalog**. P1/P2 yang belum di-commit dipertahankan pada branch `devina`, baseline `f08cea9`.

### Model dan audit

- Sumber status tunggal adalah `users.account_status`: `active` atau `suspended`; default `active` mempertahankan akses user existing. `account_version` default 0 adalah versi sesi/keputusan, bukan status bisnis tambahan. Kolom tidak termasuk mass-assignable fields dan tidak diterima sebagai sumber status dari form profil/registrasi.
- Approval tetap terpisah pada `publisher_registrations.approval_status`. Suspend/reactivate tidak mengubah role, password, profil, registrasi, atau approval. Approved + suspended ditolak; pending/rejected + active tetap ditolak portal penerbit. Approval yang terjadi saat suspended juga tidak mengaktifkan akun.
- Tabel/model audit P2 dipakai ulang, tanpa audit table kedua. Migration memperluas `publisher_registration_reviews` dengan `target_user_id`, `action`, dan `reason`; `publisher_registration_id` menjadi nullable untuk tindakan akun. Unique application constraint tetap menjaga satu keputusan approval per permohonan, sedangkan banyak aksi akun boleh memiliki application ID null. Audit P2 existing di-backfill target/action/reason-nya.
- Jenis tindakan: `approval`, `rejection`, `suspension`, `reactivation`. Semua menyimpan aktor, target, status sebelum/sesudah, alasan bila relevan, dan timestamp. `User::accountActions()` menghubungkan history user; relasi `PublisherRegistration::review()` tetap khusus keputusan aplikasi.
- Foreign key restrict tetap menjaga identitas target/aktor audit. Tidak ada endpoint untuk mengubah audit. Rollback schema P3 menghapus entry audit P3 sebelum mengembalikan schema P2; jangan rollback migration ini di environment bernilai tanpa meninjau retensi/backup audit.

### UI, izin, dan transaksi

- P2 hanya memiliki menu pendaftaran penerbit. P3 menambahkan satu resource **Kelola Pengguna** pada `/admin/users` (daftar/detail), khusus user dengan role buyer/publisher. Pencarian nama/email, filter peran, dan filter status akun menggunakan query database. Detail memuat status akun dan approval terpisah serta riwayat tindakan. Tidak ada CRUD role, user creation/deletion, rekening, katalog, atau statistik.
- `UserPolicy` mensyaratkan panel `admin`, email terverifikasi, akun aktif, permission `access-admin-panel`, dan permission baru `manage-user-accounts` pada guard `web`. Permission disiapkan seeder tanpa grant otomatis. Operator tepercaya dapat memberikan permission tersebut melalui API Spatie hanya kepada admin yang telah disetujui.
- `changeAccountStatus` menolak target diri sendiri, target tanpa role buyer/publisher, role tambahan di luar buyer/publisher, role admin/administrator/super-admin, serta setiap target yang memiliki permission panel/review/manajemen akun (langsung atau diwariskan). Akun administrator lain/terakhir dan service account tidak dapat dinonaktifkan melalui resource ini. Kebijakan manajemen administrator tidak dibuat di P3.
- `ChangeAccountStatus::handle($actor, $targetId, $status, $expectedVersion, $reason)` memuat ulang aktor, mengunci target `FOR UPDATE`, memeriksa policy dan versi/status terbaru, lalu menyimpan status, increment versi, audit, dan notification job dalam transaksi. Suspend wajib alasan yang di-trim, maksimal 2000 karakter. Reactivate memakai transisi suspended → active; tidak memberi role/approval. Repeated action atau versi halaman lama ditolak tanpa audit/email tambahan, termasuk halaman lama dari sebelum siklus suspend-reactivate.

### Login dan sesi

- Listener `Login` Laravel memuat ulang User dan menolak autentikasi akun nonaktif, mengakhiri sesi/cookie terkait, serta mengembalikan error generik. Listener berlaku pada guard sesi yang digunakan Fortify, publisher login, Filament, dan jalur login lain yang mengeluarkan event framework; tidak dibuat authentication backend baru. Login sukses menyimpan `account_version` pada sesi.
- `EnsureAccountActive` memeriksa status terbaru serta versi sesi pada setiap request web. Middleware juga dipasang persistent pada panel Filament/Livewire. Sesi lama tanpa versi dianggap versi 0 agar user existing tetap kompatibel sebelum perubahan status pertama. Setelah suspend/reactivate, versi berbeda membuat sesi lama tidak dapat hidup kembali otomatis.
- Penolakan request browser mengeluarkan user dan mengarahkan ke login dengan pesan status; JSON mendapat 403. Logout tetap dilewatkan agar user tidak terjebak. Pengguna suspended tetap dapat meminta reset password dari kondisi guest, tetapi reset password tidak mengaktifkan akun. Verifikasi email dan permission admin tetap berlaku.
- Setiap perubahan status merotasi remember token. Pada driver sesi database, seluruh row sesi milik target dihapus; sesi aktor/user lain dipertahankan. Driver file/Redis/cookie tetap dibatasi pemeriksaan versi/status pada request selanjutnya. Pengguna harus login ulang setelah reaktivasi.
- Kontrak untuk route web baru: gunakan auth/verified dan policy bisnis seperti biasa; group web sudah memuat pemeriksaan aktif. Alias middleware `active` disediakan untuk group sesi lain yang membutuhkan kontrak sama. Untuk job/proses di luar request, muat User terbaru lalu periksa `isActive()`/policy tepat sebelum operasi yang memerlukan akun aktif. Alias ini mengasumsikan Laravel session/web guard dan bukan pengganti desain autentikasi API stateless.

### Email dan handoff

`AccountStatusChanged` memakai notifikasi encrypted/database queue, transaksi yang sama, retry 3 kali dan backoff 60/300 detik seperti P2. Job tidak terlihat worker sebelum commit; enqueue failure membatalkan status/audit. Email menyampaikan keputusan pada waktu tindakan dan alasan terkait; worker memakai data penerima User terbaru. `MAIL_ACCOUNT_STATUS_MAILER` default smtp. Worker database, APP_KEY, SMTP, failed_jobs, dan batas at-least-once delivery mengikuti prosedur P2. Notifikasi sengaja tetap dikirim kepada akun suspended agar keputusan dapat diketahui pemiliknya.

Ghazy perlu mempertahankan active-user requirement untuk checkout; Dimas memakai `canAccessPublisherPortal()` dan policy pada pengelolaan penerbit/buku. Invoice/library P4/P5 harus membatasi akses akun nonaktif sambil menjaga kepemilikan/transaksi tetap tersimpan. Modul order/payment/library/buku belum tersedia di scope aktual, sehingga tidak dibuat atau diklaim teruji oleh P3. Tidak ada data pembelian yang dihapus oleh tindakan status akun.

### Hasil verifikasi P3 — 12 November 2026

- Regresi final `php artisan test`: **148 tes lulus, 894 assertions**. Tambahan P3 mencakup 27 skenario pada `AccountStatusTest` dan `AccountStatusConcurrencyTest`: UI/query/filter, suspend/reactivate, alasan, audit, sesi baru/lama, remember token, JSON, data profil/role, administrator/service account, pencabutan izin, independensi approval, rollback antrean, dan upgrade schema dengan audit legacy.
- Dua proses suspend pada target dan versi yang sama menghasilkan satu perubahan, satu audit, satu job; proses lain ditolak sebagai stale. Worker nyata memproses job terenkripsi dengan mailer in-memory. Pengiriman SMTP eksternal tidak dilakukan.
- Regresi awal pernah mencapai timeout startup proses 30 detik pada uji konkurensi P2; batas proses kedua tes konkurensi menjadi 60 detik, tanpa mengurangi assertion. Uji konkurensi terpisah dan regresi final kemudian lulus.
- Pint seluruh repository, PHPStan, `npm run check`, `npm run types:check`, `npm run build`, route admin, dan `git diff --check` lulus. Build mempertahankan peringatan opsional fontaine yang sudah ada. Terdapat delapan route admin termasuk list/detail `/admin/users`.
- Tes memakai PHP 8.4.27 portable dan PostgreSQL 18 sementara pada port 49839 / database `ikapi_marketplace_test`; cluster dihentikan setelah verifikasi. `.env`, database harian, user nyata, dan grant reviewer/manager tidak diubah. Tidak ada commit/push/merge/deploy.
- Belum selesai secara operasional: QA visual desktop/mobile, SMTP/inbox nyata, konfigurasi PHP/PostgreSQL permanen, migration serta provisioning manager pada environment tujuan. Untuk menyiapkan izin, jalankan seeder permission yang ditinjau dan berikan `manage-user-accounts` hanya kepada admin yang disetujui; jangan memakai publik registration atau mengedit database secara sembarang. Dokumentasi provisioning P1 dan worker P2 tetap berlaku.
- UC-41 moderasi katalog tidak diimplementasikan; P4/P5 dan modul PIC lain tidak dikerjakan.

## Invoice pembelian — persiapan UC-22 (Devina P4)

**Status: integrasi transaksi blocked, belum end-to-end selesai.** Audit 12 November 2026 pada branch `devina`, HEAD `f08cea9`, tidak menemukan Order, OrderItem, Payment, Book, migration transaksi, webhook pembayaran terverifikasi, atau purchase history UC-17. Folder domain Orders/Payments/Catalog masih hanya skeleton sebelum persiapan ini. Pengguna mengonfirmasi modul tersebut memang belum tersedia karena pengerjaan bertahap. Tidak dibuat transaksi pengganti, status paid baru, tabel pembayaran, route invoice palsu, atau riwayat pembelian kedua. Perubahan P1–P3 dipertahankan.

UC-22 DOCX mensyaratkan invoice PDF untuk pesanan lunas milik pengguna dari riwayat pembelian. Dokumen stack juga mensyaratkan harga snapshot dan pembayaran yang diverifikasi backend. ERD/skema awal memuat pembayaran/detail transaksi, tetapi tidak menetapkan model/status canonical yang dapat langsung dipakai. Karena itu tidak ada nama field database atau status paid yang diasumsikan sudah disepakati.

### Bagian yang sudah tersedia

- `App\Domain\Orders\Invoices\InvoiceDocument` dan `InvoiceLine` adalah objek presentasi immutable, **bukan model transaksi atau bukti lunas**. Tidak ada constructor/binding yang membaca request publik, database, harga katalog, atau provider pembayaran. Data fixture hanya ada dalam tes.
- Kontrak presentasi membutuhkan nomor pesanan, referensi transaksi, waktu pembayaran, identitas pembeli, serta seluruh item dengan judul/nama penerbit/kuantitas/harga/total snapshot. Nama properti objek ini tidak menetapkan nama kolom/model Ghazy. Mapping ke record canonical masih harus ditentukan setelah implementasi transaksi tersedia.
- Nilai Rupiah bertipe integer. Validasi memeriksa quantity positif, nominal nonnegatif, overflow perkalian/penjumlahan, subtotal sama dengan jumlah item, dan total sama dengan subtotal dikurangi diskon ditambah fee. Angka harus dipetakan dari snapshot pembayaran, bukan dihitung dari harga katalog terbaru. Format Rupiah tidak melewati floating point. Representasi satuan harus dikonfirmasi dengan kontrak Ghazy; jangan membulatkan nilai minor units secara diam-diam.
- Diskon/fee nullable hanya ditampilkan jika nominal tersebut memang tersedia/disetujui dalam transaksi. Tidak ada aturan pajak, komisi, promo, invoice number generator, atau entitlements baru. Objek presentasi tidak mengizinkan perubahan nomor/nominal setelah dibuat.
- View `resources/views/invoices/purchase.blade.php` menyediakan identitas teks IKAPI, metadata, item multi-penerbit, nominal rata kanan, header tabel berulang, dan tanggal WIB. Semua nilai teks di-escape Blade. Tidak ada remote image/font, logo palsu, script, atau konten transaksi hardcoded. CSS mengantisipasi wrapping/paginasi sederhana, tetapi hasil PDF belum dibuktikan.

### Kontrak integrasi yang masih harus disepakati

| Kebutuhan             | Sumber yang harus diberikan Ghazy/Aprila                                           | Status saat ini                                |
| --------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| Pemilik order         | Relasi/order buyer key dari sesi server                                            | Belum tersedia                                 |
| Eligible invoice      | Canonical paid/settled state beserta bukti verifikasi backend                      | Belum tersedia; tidak boleh dari browser/query |
| Identitas transaksi   | Nomor order stabil, referensi transaksi, paid timestamp                            | Belum tersedia                                 |
| Item/nominal historis | Snapshot judul, penerbit, quantity, unit price, line totals, subtotal, paid amount | Belum tersedia                                 |
| Diskon/fee            | Nilai tersimpan dan kebijakan bisnis yang disetujui                                | Belum disepakati; tidak diarang                |
| UI konsumen           | Halaman/list riwayat pembelian UC-17                                               | Belum tersedia                                 |

Sesudah sumber canonical tersedia, implementasikan adapter dari record tersebut ke `InvoiceDocument` **setelah** pemeriksaan authenticated/verified/active user, ownership, dan eligibility pembayaran. Read konsisten harus memuat seluruh item dari snapshot lintas penerbit tanpa N+1. Admin tidak mendapat bypass ownership otomatis. Invoice tidak boleh terpengaruh perubahan harga katalog.

Belum ada route download aktual atau route name yang dapat dipanggil Aprila. Pola `/orders/{order}/invoice` hanya kandidat, bukan kontrak yang telah diterapkan. Endpoint final perlu response `application/pdf`, attachment filename stabil berbasis identifier canonical yang disanitasi, serta cache `private, no-store`. Order tidak ada/tidak dimiliki harus mengikuti policy anti-enumeration; unpaid tidak boleh menghasilkan invoice. Account aktif tetap mengikuti middleware P3. Error renderer/storage wajib memakai pesan UC-22: **“Gagal mengunduh invoice, silakan coba beberapa saat lagi.”** Jangan log dokumen penuh/PII atau membocorkan stack trace.

Aprila nanti menambahkan satu tombol **Unduh Invoice** hanya pada order eligible dan memakai URL yang disediakan backend, tanpa membuat klaim sukses sebelum file diterima. Tidak ada perubahan purchase history pada persiapan ini. P5 juga belum dapat menganggap ada relasi purchased items/entitlement atau canonical paid state dari P4.

### Evaluasi renderer dan verifikasi

Tidak ada PDF renderer pada composer.json/lock yang diaudit. Kandidat awal adalah [Dompdf](https://github.com/dompdf/dompdf), renderer PHP berbasis HTML/CSS, dengan font DejaVu untuk cakupan Unicode. Lisensi upstream LGPL-2.1; wrapper [laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) memakai MIT. Ini evaluasi kandidat, **bukan pemilihan versi atau bukti kompatibilitas Laravel 13 yang sudah diuji**. Versi paket, kompatibilitas Composer aktual, dan implikasi lisensi tetap perlu diverifikasi sebelum instalasi. Tidak ada dependency ditambahkan saat sumber data/integrasi belum tersedia.

Untuk tahap PDF nantinya, pilih satu engine saja dan uji batas CSS/table pagination; jangan mengasumsikan layout browser identik dengan renderer. Pertahankan remote access/PHP/JavaScript disabled, font/aset lokal yang dibatasi, dan rendering on-demand tanpa penyimpanan publik atau queue per download yang belum diperlukan. Satu row yang lebih tinggi dari halaman perlu penanganan khusus setelah renderer dipilih. Tidak ada screenshot/print browser sebagai pengganti server PDF.

`php artisan test --filter=InvoicePresentation` lulus **17 tes, 35 assertions** dengan PHP 8.4 portable, tanpa database/provider pembayaran. Cakupan terbatas pada objek presentasi dan HTML Blade: konsistensi integer/overflow, formatting tanpa precision loss, multi-item/publisher, escaping, optional fee/discount, WIB, serta immutable/repeated rendering. Tes ini **tidak membuktikan** ownership, canonical paid state, HTTP PDF attachment, perubahan harga katalog, keamanan endpoint, validitas/paginasi/visual PDF, atau integrasi history. Semua pengujian tersebut menunggu modul transaksi dan renderer. Tidak ada claim PDF valid atau UC-22 selesai.

## Perpustakaan pribadi — persiapan UC-23 (Devina P5)

**Status: persiapan UI/kontrak; integrasi kepemilikan blocked. UC-23 belum selesai end-to-end.** Audit pada branch `devina`, HEAD `f08cea9`, mengonfirmasi tidak ada Book, Order/OrderItem/Payment, entitlement, Favorite/Wishlist, reading progress/bookmark, katalog, atau route reader aktual. Pengguna sebelumnya mengonfirmasi dependensi transaksi dikerjakan bertahap dan belum tersedia. P4 hanya memiliki objek/template presentasi invoice, bukan sumber transaksi atau kepemilikan. Tidak ada schema/query library, fulfillment, webhook, atau route/menu produksi baru yang dibuat P5.

### Implementasi yang tersedia

- `resources/js/features/library/personal-library.tsx` adalah komponen React/Inertia yang belum dipasang ke halaman/route. Menggunakan Button existing, layout warm paper dan primary biru dari DESIGN.md, grid responsif, metadata teks, serta fallback cover sederhana saat gambar tidak tersedia/gagal. Tidak ada fixture produksi, rating/progress palsu, localStorage, reader/PDF viewer, atau search UC-24.
- Empat tab: Semua Buku, Sedang Dibaca, Belum Dibaca, Buku Favorit. Tab memakai tablist/tab/tabpanel, selected state, roving tabIndex, dan navigasi ArrowLeft/ArrowRight/Home/End. Pergantian tab hanya state UI, tanpa fetch ulang yang tidak diperlukan. Browser accessibility/keyboard interaction belum diuji langsung.
- `library-state.ts` memuat kontrak **presentasi** `LibraryCollection`, `LibraryBook`, dan `OwnedLibraryBook`, bukan schema database atau bukti entitlement. `owned` harus berasal dari query hak akses user terautentikasi; `favorites` adalah daftar terpisah. ID string hanya identifier tampilan yang nanti dipetakan ke identitas canonical Book; tidak ada asumsi nama kolom/model sumber.
- Semua Buku membaca `owned` saja. Tab Sedang Dibaca/Belum Dibaca hanya mengambil `readingStatus` eksplisit `reading`/`unread` dari reader. Nilai `finished` tetap di Semua Buku; null berarti belum diketahui, tidak dikategorikan sebagai unread/reading. Jika seluruh owned belum punya status, pesan tab terkait adalah “Status membaca belum tersedia.”
- Favorit tidak memiliki readerHref dalam kontrak tipe. `bookAction` hanya menggunakan readerHref dari owned counterpart dengan ID yang sama. Favorit tanpa owned counterpart dapat menuju detail buku, bukan reader; field reader palsu pada data favorit tidak dipakai. Jika belum ada link reader/detail yang sah, tidak dibuat tautan atau disabled action yang menyamar sebagai integrasi.
- Tampilan meniadakan duplikasi card berdasarkan ID dalam masing-masing daftar, tanpa mengubah data input/transaksi. Ini bukan implementasi idempotensi entitlement atau kebijakan duplicate purchase di backend.
- Empty state global hanya dipakai jika owned dan favorit keduanya kosong. Tab yang kosong memiliki pesan tersendiri, sehingga koleksi di tab lain tidak dianggap hilang. CTA Jelajahi Katalog hanya muncul jika server menyediakan catalogHref yang valid; tidak ditebak dari home/route palsu.
- URL presentasi dibatasi ke path aplikasi relatif yang valid; external/protocol-relative/javascript, whitespace/backslash, malformed encoding, dan path PDF ditolak. Cover memakai URL lokal yang disediakan backend, bukan gambar acak atau URL PDF asli. Pemeriksaan ini defense in depth saja: **bukan otorisasi reader, validasi entitlement, atau jaminan sebuah endpoint tidak mengirim file asli**. Backend harus menghasilkan route reader/cover yang sesuai kebijakan penyimpanan privat.

### Handoff yang masih menunggu implementasi sumber

| PIC/sumber | Kontrak yang diperlukan                                                                                       | Batas saat ini                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Ghazy      | Verified-payment/entitlement canonical, buyer scope, sumber item, grant idempotent dan aturan pembelian ganda | Tidak ada grant/query ownership; jangan membaca redirect sukses, query user_id, atau status frontend |
| Vayola     | Book ID/title/author/publisher, cover aman, detail/catalog destination dan status publikasi                   | Metadata/URL hanya input presentasi; no catalog route aktual                                         |
| Falih      | Authorized reader destination, reading/unread/finished definition dan progress per user/book                  | readerHref null dan readingStatus null sampai ada kontrak; tidak membuat progress kedua              |
| Aprila     | Pencarian UC-24 pada query koleksi canonical yang sama                                                        | Tidak ada search input; tab ID `all/reading/unread/favorites` dapat dipakai saat integrasi           |

Adapter Laravel nanti wajib memakai User dari sesi, auth/verified/active (P3), serta query per-user dari entitlement yang disepakati. Jangan memuat seluruh katalog lalu memfilter kepemilikan di browser. Tidak ada bypass administrator otomatis atau user ID dari browser sebagai sumber scope. Download invoice P4 bukan bukti entitlement. Pending/failed/expired/cancelled atau paid belum terverifikasi tidak boleh menambah owned. Favorit user lain tidak boleh terbawa dalam props.

Komponen saat ini mengasumsikan daftar scoped yang lengkap dan dibatasi ukurannya; belum ada pagination produksi. Setelah sumber data tersedia, tab/filter/pagination/search harus dipindahkan ke query server yang menjaga ownership, menggunakan eager loading dan metadata pagination yang disepakati. Jangan memfilter hanya satu halaman lalu mengklaim tab/empty state mewakili seluruh koleksi. Field metadata harus dipilih eksplisit, tanpa storage path/PDF mentah atau model User/Order lengkap.

Rule refund/revocation/unpublished/take-down belum disepakati: jangan menghapus koleksi atau memberi akses file otomatis. Suspension P3 membatasi request tanpa menghapus kepemilikan; library dan reader nanti harus sama-sama menerapkan active/ownership checks. Tidak ada route library aktual untuk dikonsumsi Falih/Aprila sampai backend tersebut siap.

### Verifikasi dan keterbatasan P5

`node --experimental-strip-types --test tests/Frontend/library-state.test.mjs` lulus **7 tes** menggunakan node:test bawaan, tanpa dependency QA baru. Data/URL fixture hanya ada pada file tes dan bukan sumber produksi. Tes membuktikan pemisahan owned/favorites, unknown progress, deduplikasi tampilan, pemilihan reader dari owned counterpart, ketiadaan link buatan, penolakan URL tidak aman/PDF, dan empty state sesuai konteks. Tes tersebut tidak membuktikan backend ownership, grant idempotency, policy reader, atau integrasi paid-state.

UI kosong/terisi, cover fallback saat error, wrapping, interaksi keyboard, serta mobile/desktop belum menjalani visual QA browser. TypeScript/lint/build memeriksa source yang tersedia, bukan bukti route/integrasi library bekerja. Tidak ada claim UC-23 selesai; blokir utama tetap Book/entitlement/favorites/reader/catalog. P1–P4 dipertahankan, tidak ada commit/push/merge/deploy atau pekerjaan PIC lain.

Pemeriksaan aktual P5 pada 12 November 2026: 7 tes node:test lulus; `npm run types:check`, `npm run check`, `npm run build`, dan `git diff --check` lulus. Komponen yang belum dipasang ke route diperiksa TypeScript; build aplikasi bukan bukti komponen tersebut telah terintegrasi atau melewati QA visual. Regresi `InvoicePresentation` P4 tetap **17 tes lulus, 35 assertions**. Tidak ada dependency, migration, atau backend route baru, dan tidak diperlukan perubahan database untuk persiapan P5 ini. Build mempertahankan peringatan fontaine opsional yang sudah ada.

## Identitas pembeli

- Satu record `App\Models\User` adalah identitas autentikasi untuk semua aktor.
- Kolom `users.phone` bertipe string nullable agar user lama tetap kompatibel. Registrasi pembeli baru mewajibkan nomor telepon dan menyimpan format kanonis: nomor lokal `08…` menjadi `+628…`; input `62…` menjadi `+62…`; input internasional dengan tanda `+` dipertahankan.
- Role internal pembeli: `buyer` pada guard `web`. Jalankan `php artisan migrate --seed` pada setup database baru untuk menyiapkannya. Registration action mengharuskan role tersebut tersedia dan menetapkannya dalam transaksi yang sama dengan pembuatan user.
- Form registrasi publik tidak menerima role, permission, atau status verifikasi sebagai sumber hak akses.

## Sesi, route, dan shared data

- Login, registrasi, verifikasi email, reset kata sandi, throttling, CSRF, dan logout tetap menggunakan Fortify serta guard/session `web`.
- Route names Fortify yang dipakai UI adalah `register`, `register.store`, `login`, `login.store`, dan `logout`. Keberhasilan mengarah ke `/dashboard` sesuai `fortify.home` dan intended destination Laravel.
- Middleware Inertia membagikan identitas terautentikasi melalui `auth.user`; gunakan ID user dari sesi server untuk kepemilikan data dan otorisasi.
- Endpoint dan business module berikutnya wajib mengecek policy/permission yang sesuai; jangan mempercayai role atau user ID dari payload browser.

## Integrasi PIC

- Order, pembayaran, pustaka, profil pembeli, dan reader menggunakan `User` yang sama serta ID dari sesi terautentikasi.
- Profil pembeli berikutnya dapat menggunakan `phone` yang sudah disediakan; jangan membuat credential atau tabel autentikasi pembeli terpisah.
- Penerbit tetap aktor berbeda melalui role/profil yang sesuai. Registrasi publik pembeli tidak memberi role penerbit atau administrator.

## Profil pembeli UC-03

- Gunakan route settings yang sudah ada: `profile.edit` (`GET /settings/profile`) dan `profile.update` (`PATCH /settings/profile`), keduanya di balik middleware `auth`.
- Sumber data tetap record `App\Models\User` milik sesi terautentikasi. Field profil yang dibagikan adalah `id`, `name`, `email`, `phone`, `address`, `avatar_url`, `email_verified_at`, dan `roles`; jangan membagikan model mentah atau field rahasia.
- `name`, `email`, `address`, dan `avatar` dapat diperbarui melalui validated profile request. Email yang berubah mengosongkan `email_verified_at` agar verifikasi ulang tetap berlaku.
- `phone` ditampilkan dari kolom yang disediakan UC-01, tetapi read-only pada halaman ini karena belum ada workflow perubahan/verifikasi nomor telepon di settings. Jangan menganggapnya sebagai alamat pengiriman.
- `address` disimpan nullable pada `users` dengan batas validasi 1000 karakter; tidak ada tabel profil pembeli terpisah.
- `avatar_path` adalah path relatif hasil nama acak sistem pada disk `public` di folder `avatars/`. UI dan modul lain menggunakan accessor `avatar_url`; jangan menyimpan URL browser atau Base64 sebagai sumber permanen.
- Pastikan symbolic link Laravel `public/storage` tersedia pada setiap environment (`php artisan storage:link`) agar URL disk `public` dapat dilayani.
- File avatar menerima JPG, JPEG, PNG, atau WebP hingga 2 MB. Validasi dilakukan server-side; file lama baru dihapus setelah referensi avatar baru berhasil disimpan.
- Perubahan profil hanya mengambil user dari sesi dan field tervalidasi. Payload tidak dapat mengubah role, permission, email verification, password, status akun, atau identitas penerbit.

## Pemulihan kata sandi — Prompt 04

- Gunakan broker `users` dan route Fortify yang sama: `password.request`, `password.email`, `password.reset`, dan `password.update`. Buyer, publisher, dan admin memakai satu User/password broker; tidak ada tabel token atau endpoint reset terpisah.
- Token disimpan oleh broker Laravel pada `password_reset_tokens`, berlaku 60 menit, dan broker membatasi pembuatan ulang token per akun dengan jeda 60 detik. Throttle aplikasi tambahan membatasi reset-link request hingga 3 per alamat per menit dan 10 per IP per menit, serta submit reset hingga 10 per IP per menit.
- Respons publik untuk setiap email dengan format valid selalu sama. Request divalidasi sebelum job dibuat; job pemanggil broker dan notifikasi reset dienkripsi di queue. Reset token tidak ditulis lewat mailer `log`.
- Password reset email dan pemberitahuan setelah perubahan password menggunakan Laravel Notifications yang queued/encrypted, berbahasa Indonesia, tanpa memasukkan password atau token ke email pemberitahuan perubahan.
- Email memakai notification Laravel berbahasa Indonesia dan tautan dibangun dari `APP_URL`, bukan Host header request. `MAIL_PASSWORD_RESET_MAILER` default `smtp`; environment produksi wajib mengatur host/credential SMTP yang sah, menggunakan HTTPS pada `APP_URL`, dan menjalankan queue worker. Pengujian lokal dengan `Notification::fake()`/`Queue::fake()` tidak membuktikan pengiriman email produksi.
- Form reset memakai route broker, token/email readonly/terikat, aturan password yang sama dengan registrasi, dan error generik untuk token invalid/kedaluwarsa. Reset sukses mengarahkan ke login, merotasi remember token melalui Fortify, dan membatalkan sesi aktif bila session driver `database`.
- Saat deployment memakai driver sesi selain `database`, event hook aplikasi tidak dapat menghapus sesi lintas perangkat dari backend tersebut; rotasi remember token tetap terjadi, tetapi operator harus memilih mekanisme invalidasi yang sesuai bila driver diganti.
- Penugasan Prompt 04 mencakup lupa/reset password, tetapi nomor UC belum diselaraskan: informasi pembagian kerja menyebut recovery dalam tanggung jawab Fadli sementara skenario use case mendefinisikan UC-26 sebagai chatbot. Nomor UC belum ditetapkan di workspace; jangan menyebut pekerjaan recovery sebagai UC-26 dan jangan mengubah dokumen skenario/chatbot.

## Keputusan alur UC-01

Fortify tetap mengautentikasi user setelah registrasi dan meminta verifikasi email. Setelah registrasi, user diarahkan ke destinasi aman Fortify (`/dashboard` atau intended destination), bukan dikembalikan ke halaman login sebagaimana literal skenario UC-01. Keputusan sementara ini mempertahankan starter kit dan verifikasi email; penyelarasan redirect dengan tim masih diperlukan.
