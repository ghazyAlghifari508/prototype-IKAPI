{{--
  Account settings: notification preferences, password modal (demo, nothing is saved server-side).
  Source: docs/design/prototype-copy/user/pengaturan_akun_desktop.html (771 lines). Markup, classes, ids and copy are verbatim; only links,
  asset URLs and the shell come from the app. See docs/migration/p6-buyer-flows.md.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \Illuminate\Support\Facades\Route::has($name) ? route($name, $params) : '#';
@endphp

@extends('layouts.public')

@push('head')
<style>
@layer utilities {
:root {
      --color-primary: #673de6;
      --color-primary-hover: #5025d1;
      --color-primary-deep: #2f1c6a;
      --color-canvas: #ffffff;
      --color-surface-soft: #f5f6ff;
      --color-surface-neutral: #f5f5f6;
      --color-text-primary: #222225;
      --color-text-secondary: #62636b;
      --color-border: #e5e7eb;
    }
    @layer base {
      html, body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #222225;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      body {
        overflow-x: clip;
      }
      main > :first-child {
        margin-top: 0 !important;
      }
      main > :last-child {
        margin-bottom: 0 !important;
      }
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    /* Toggle Switch Styling */
    .switch-checkbox:checked + .switch-track {
      background-color: #673de6;
    }
    .switch-checkbox:checked + .switch-track .switch-thumb {
      transform: translateX(20px);
    }
}
</style>
@endpush

@section('title', 'Pengaturan Akun — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')

@section('account', 'member')

@section('cart_count', '2')

@section('search_placeholder', 'Cari judul buku, penulis, atau topik...')

@section('identity_ids', '1')

@section('main_pt', 'pt-28')

@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex flex-col w-full">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full flex flex-col gap-6">

      <!-- Mobile Compact Account Navigation Menu -->
      <details class="lg:hidden group bg-white border border-border-subtle rounded-2xl text-[14px] overflow-hidden shadow-xs">
        <summary class="px-4 py-3 cursor-pointer font-semibold text-ink-body flex items-center justify-between list-none select-none">
          <div class="flex items-center gap-2.5 text-primary">
            <span class="material-symbols-outlined text-[20px]">settings</span>
            <span>Menu Akun: Pengaturan Akun</span>
          </div>
          <span class="material-symbols-outlined text-[20px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div class="p-3 border-t border-border-subtle bg-surface-neutral flex flex-col gap-1">
          <a href="{{ $links('profile.show') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Profil Saya</a>
          <a href="{{ $links('orders') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Pesanan</a>
          <a href="{{ $links('library') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Perpustakaan Saya</a>
          <a href="{{ $links('reviews') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Ulasan</a>
          <a href="{{ $links('profile.settings') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-soft text-primary font-bold">Pengaturan Akun</a>
          <a href="{{ $links('help') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Bantuan</a>
          <div class="h-px bg-border-subtle my-1"></div>
          <a href="{{ $links('login') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold">Keluar Akun</a>
        </div>
      </details>

      <!-- Page Header -->
      <div class="pb-2 border-b border-border-subtle">
        <h1 class="text-[30px] md:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
          Pengaturan Akun
        </h1>
        <p class="text-[15px] text-ink-muted mt-1">
          Atur keamanan dan preferensi akunmu.
        </p>
      </div>

      <!-- 2-COLUMN WORKSPACE: Google Stitch Floating Sidebar + Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT FLOATING SIDEBAR (Independent Rounded Panel) -->
        <aside class="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div class="lg:sticky lg:top-36 bg-white rounded-3xl border border-border-subtle shadow-sm p-6 flex flex-col gap-6">

            <!-- Mini Profile Identity Header -->
            <div class="flex items-center gap-3.5 pb-5 border-b border-border-subtle">
              <div id="sidebar-avatar" class="w-12 h-12 rounded-full bg-primary text-white font-bold text-[18px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                <span id="sidebar-avatar-initials">AH</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span id="sidebar-user-name" class="font-bold text-[15px] text-ink-body truncate">Ahmad Hidayat</span>
                <span id="sidebar-user-email" class="text-[12px] text-ink-muted truncate">ahmad.hidayat@literasi.id</span>
              </div>
            </div>

            <!-- Navigation Menu Links -->
            <nav class="flex flex-col gap-1.5 text-[14px]">
              <a href="{{ $links('profile.show') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">person</span>
                <span>Profil Saya</span>
              </a>
              <a href="{{ $links('orders') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Riwayat Pesanan</span>
              </a>
              <a href="{{ $links('library') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">local_library</span>
                <span>Perpustakaan Saya</span>
              </a>
              <a href="{{ $links('reviews') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">rate_review</span>
                <span>Riwayat Ulasan</span>
              </a>
              <a href="{{ $links('profile.settings') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-soft text-primary font-bold shadow-xs transition-colors">
                <span class="material-symbols-outlined text-[20px]">settings</span>
                <span>Pengaturan Akun</span>
              </a>
              <a href="{{ $links('help') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">help</span>
                <span>Bantuan</span>
              </a>

              <div class="h-px bg-border-subtle my-2"></div>

              <a href="{{ $links('login') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-semibold">
                <span class="material-symbols-outlined text-[20px]">logout</span>
                <span>Keluar Akun</span>
              </a>
            </nav>

          </div>
        </aside>

        <!-- RIGHT MAIN: Account Settings Workspace -->
        <section class="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">

          <!-- SECTION 1: KEAMANAN AKUN -->
          <div class="bg-white rounded-3xl border border-border-subtle shadow-sm p-6 sm:p-8 flex flex-col gap-6">
            <div class="pb-3 border-b border-border-subtle">
              <h2 class="text-[20px] sm:text-[22px] font-bold text-ink-body tracking-tight">
                Keamanan Akun
              </h2>
              <p class="text-[14px] text-ink-muted mt-1">
                Kelola kata sandi akun dan pantau sesi perangkat aktif.
              </p>
            </div>

            <!-- Password Management Block -->
            <div class="p-5 rounded-2xl bg-surface-neutral border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">lock</span>
                  <span class="text-[15px] font-bold text-ink-body">Kata Sandi Akun</span>
                </div>
                <p id="password-last-updated" class="text-[13px] text-ink-muted">
                  Terakhir diperbarui: 12 Oktober 2026
                </p>
              </div>
              <button type="button" class="h-10 px-5 rounded-xl bg-white hover:bg-surface-soft border border-border-subtle text-primary font-bold text-[13px] transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0" onclick="openPasswordModal()">
                <span class="material-symbols-outlined text-[16px]">key</span>
                <span>Ubah Kata Sandi</span>
              </button>
            </div>

            <!-- Active Session Block -->
            <div class="p-5 rounded-2xl bg-surface-neutral border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">devices</span>
                  <span class="text-[15px] font-bold text-ink-body">Perangkat Aktif Saat Ini</span>
                </div>
                <p class="text-[13px] text-ink-muted">
                  Chrome Browser di Windows 11, Bandung, Indonesia
                </p>
              </div>
            </div>
          </div>

          <!-- SECTION 2: PREFERENSI NOTIFIKASI -->
          <div class="bg-white rounded-3xl border border-border-subtle shadow-sm p-6 sm:p-8 flex flex-col gap-6">
            <div class="pb-3 border-b border-border-subtle">
              <h2 class="text-[20px] sm:text-[22px] font-bold text-ink-body tracking-tight">
                Preferensi Notifikasi
              </h2>
              <p class="text-[14px] text-ink-muted mt-1">
                Pilih pemberitahuan yang ingin kamu terima melalui surel dan peramban.
              </p>
            </div>

            <div class="space-y-4">

              <!-- Toggle Item 1 -->
              <div class="p-4 rounded-2xl border border-border-subtle bg-white hover:bg-[#f5f6ff66] transition-colors flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <span class="text-[14px] font-bold text-ink-body block">Status Pesanan &amp; Lisensi E-Book</span>
                  <p class="text-[13px] text-ink-muted">Pemberitahuan instan saat pembayaran diverifikasi dan buku siap dibaca.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="pref-order-status" type="checkbox" checked="" class="sr-only switch-checkbox" onchange="markPreferencesDirty()">
                  <div class="switch-track w-11 h-6 bg-border-subtle rounded-full transition-colors relative">
                    <div class="switch-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs"></div>
                  </div>
                </label>
              </div>

              <!-- Toggle Item 2 -->
              <div class="p-4 rounded-2xl border border-border-subtle bg-white hover:bg-[#f5f6ff66] transition-colors flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <span class="text-[14px] font-bold text-ink-body block">Pengingat Kegiatan Literasi Jawa Barat</span>
                  <p class="text-[13px] text-ink-muted">Pemberitahuan agenda lokakarya, bedah naskah kuno, dan festival buku daerah.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="pref-events" type="checkbox" checked="" class="sr-only switch-checkbox" onchange="markPreferencesDirty()">
                  <div class="switch-track w-11 h-6 bg-border-subtle rounded-full transition-colors relative">
                    <div class="switch-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs"></div>
                  </div>
                </label>
              </div>

              <!-- Toggle Item 3 -->
              <div class="p-4 rounded-2xl border border-border-subtle bg-white hover:bg-[#f5f6ff66] transition-colors flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <span class="text-[14px] font-bold text-ink-body block">Kabar Buku Rilis Terbaru &amp; Kurasi Penerbit</span>
                  <p class="text-[13px] text-ink-muted">Warta bulanan mengenai terbitan berlisensi baru dari penerbit anggota IKAPI.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="pref-new-books" type="checkbox" class="sr-only switch-checkbox" onchange="markPreferencesDirty()">
                  <div class="switch-track w-11 h-6 bg-border-subtle rounded-full transition-colors relative">
                    <div class="switch-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs"></div>
                  </div>
                </label>
              </div>

            </div>

            <!-- Save Notification Preferences Button -->
            <div class="pt-2 flex justify-end">
              <button id="btn-save-preferences" type="button" class="h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer" onclick="saveNotificationPreferences()">
                <span class="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Preferensi</span>
              </button>
            </div>
          </div>

          <!-- SECTION 3: PRIVASI & DUKUNGAN -->
          <div class="bg-white rounded-3xl border border-border-subtle shadow-sm p-6 sm:p-8 flex flex-col gap-4 text-[14px]">
            <div class="pb-3 border-b border-border-subtle">
              <h2 class="text-[20px] sm:text-[22px] font-bold text-ink-body tracking-tight">
                Bantuan &amp; Ketentuan
              </h2>
              <p class="text-[14px] text-ink-muted mt-1">
                Akses panduan dan kebijakan penggunaan platform IKAPI Store Jawa Barat.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <a href="{{ $links('help.chatbot') }}" class="p-4 rounded-2xl bg-surface-neutral hover:bg-surface-soft border border-border-subtle flex items-center justify-between transition-colors group">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary text-[22px]">help_center</span>
                  <div>
                    <p class="font-bold text-ink-body group-hover:text-primary transition-colors">Pusat Bantuan &amp; FAQ</p>
                    <p class="text-[12px] text-ink-muted">Solusi pembelian &amp; Web Reader</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-ink-muted group-hover:text-primary transition-transform group-hover:translate-x-1">chevron_right</span>
              </a>

              <a href="{{ $links('help.chatbot') }}" class="p-4 rounded-2xl bg-surface-neutral hover:bg-surface-soft border border-border-subtle flex items-center justify-between transition-colors group">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary text-[22px]">policy</span>
                  <div>
                    <p class="font-bold text-ink-body group-hover:text-primary transition-colors">Kebijakan Privasi &amp; Lisensi</p>
                    <p class="text-[12px] text-ink-muted">Perlindungan hak cipta e-book</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-ink-muted group-hover:text-primary transition-transform group-hover:translate-x-1">chevron_right</span>
              </a>
            </div>
          </div>

        </section>

      </div>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="modal-change-password" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pwd-modal-title">
      <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-border-subtle flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <!-- Modal Header -->
        <div class="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 id="pwd-modal-title" class="text-[18px] font-bold text-ink-body">
            Ubah Kata Sandi
          </h3>
          <button type="button" onclick="closePasswordModal()" class="w-8 h-8 rounded-full bg-surface-neutral hover:bg-border-subtle text-ink-body flex items-center justify-center transition-colors" aria-label="Tutup">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Modal Form -->
        <form id="change-password-form" class="p-6 space-y-4" onsubmit="handlePasswordSubmit(event)">
          <div class="space-y-1.5">
            <label for="current-password" class="block text-[13px] font-bold text-ink-body">
              Kata Sandi Lama <span class="text-red-500">*</span>
            </label>
            <input id="current-password" type="password" required="" class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" placeholder="Masukkan kata sandi lama">
          </div>

          <div class="space-y-1.5">
            <label for="new-password" class="block text-[13px] font-bold text-ink-body">
              Kata Sandi Baru <span class="text-red-500">*</span>
            </label>
            <input id="new-password" type="password" minlength="8" required="" class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" placeholder="Minimal 8 karakter">
          </div>

          <div class="space-y-1.5">
            <label for="confirm-password" class="block text-[13px] font-bold text-ink-body">
              Konfirmasi Kata Sandi Baru <span class="text-red-500">*</span>
            </label>
            <input id="confirm-password" type="password" minlength="8" required="" class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" placeholder="Ulangi kata sandi baru">
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-border-subtle">
            <button type="button" class="h-10 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="closePasswordModal()">
              Batal
            </button>
            <button type="submit" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-xs">
              <span>Perbarui Kata Sandi</span>
            </button>
          </div>
        </form>

      </div>
    </div>

  <div id="toast-notification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toastIcon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toastMessage">Tindakan berhasil dilakukan.</span>
    </div>
@endpush
