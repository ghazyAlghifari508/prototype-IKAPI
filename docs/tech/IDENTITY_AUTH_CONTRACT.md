# Kontrak Identitas dan Autentikasi

Kontrak ini mencakup autentikasi pembeli UC-01/UC-02 yang diimplementasikan melalui Laravel Fortify.

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
