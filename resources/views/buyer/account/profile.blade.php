{{--
  Profile page with the account sidebar and the in-page profile editor (demo localStorage profile).
  Source: docs/design/prototype-copy/user/akun_saya_profil_dropdown_navigasi_desktop.html (699 lines). Markup, classes, ids and copy are verbatim; only links,
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
}
</style>
@endpush

@section('title', 'Profil Saya — IKAPI Store Jawa Barat')

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
            <span class="material-symbols-outlined text-[20px]">person</span>
            <span>Menu Akun: Profil Saya</span>
          </div>
          <span class="material-symbols-outlined text-[20px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div class="p-3 border-t border-border-subtle bg-surface-neutral flex flex-col gap-1">
          <a href="{{ $links('profile.show') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-soft text-primary font-bold">Profil Saya</a>
          <a href="{{ $links('orders') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Pesanan</a>
          <a href="{{ $links('library') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Perpustakaan Saya</a>
          <a href="{{ $links('reviews') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Ulasan</a>
          <a href="{{ $links('profile.settings') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Pengaturan Akun</a>
          <a href="{{ $links('help') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Bantuan</a>
          <div class="h-px bg-border-subtle my-1"></div>
          <a href="{{ $links('login') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold">Keluar Akun</a>
        </div>
      </details>

      <!-- Page Header -->
      <div class="pb-2 border-b border-border-subtle">
        <h1 class="text-[30px] md:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
          Profil Saya
        </h1>
        <p class="text-[15px] text-ink-muted mt-1">
          Kelola informasi pribadi dan preferensi bacaanmu.
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
              <a href="{{ $links('profile.show') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-soft text-primary font-bold shadow-xs transition-colors">
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
              <a href="{{ $links('profile.settings') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
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

        <!-- RIGHT MAIN: Profile Form Workspace -->
        <section class="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl border border-border-subtle shadow-sm p-6 sm:p-8 lg:p-10 flex flex-col gap-8">

          <!-- Section Header -->
          <div class="pb-3 border-b border-border-subtle">
            <h2 class="text-[22px] sm:text-[24px] font-bold text-ink-body tracking-tight">
              Informasi Profil
            </h2>
            <p class="text-[14px] text-ink-muted mt-1">
              Perbarui nama, foto profil, dan preferensi bacaanmu.
            </p>
          </div>

          <form id="profile-form" class="space-y-6" onsubmit="handleProfileSubmit(event)">

            <!-- Avatar Upload / Management Block -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-2xl bg-surface-neutral border border-border-subtle">
              <div class="relative shrink-0 flex items-center justify-center">
                <div id="form-avatar" class="w-20 h-20 rounded-full bg-primary text-white text-[24px] font-bold flex items-center justify-center shadow-xs overflow-hidden">
                  <span id="form-avatar-initials">AH</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5 flex-1">
                <span class="text-[14px] font-bold text-ink-body">Foto Profil</span>
                <p class="text-[13px] text-ink-muted">
                  Format berkas: JPG, PNG, atau WebP. Ukuran maksimal 2.0 MB.
                </p>
                <div class="flex items-center gap-3 mt-1.5">
                  <label class="cursor-pointer h-9 px-4 rounded-xl bg-white hover:bg-surface-soft border border-border-subtle text-primary font-bold text-[13px] shadow-xs transition-colors flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">upload</span>
                    <span>Ubah Foto</span>
                    <input id="photo-input" type="file" accept="image/png, image/jpeg, image/webp" class="hidden" onchange="handlePhotoUpload(event)">
                  </label>
                  <button id="btn-delete-photo" type="button" class="h-9 px-3 text-ink-muted hover:text-red-600 font-medium text-[13px] transition-colors" onclick="handleDeletePhoto()">
                    Hapus Foto
                  </button>
                </div>
              </div>
            </div>

            <!-- Profile Fields Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

              <!-- Nama Lengkap (Full Width) -->
              <div class="space-y-1.5 md:col-span-2">
                <label for="full-name" class="block text-[13px] font-bold text-ink-body">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input id="full-name" name="fullName" type="text" required="" class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" value="Ahmad Hidayat" oninput="handleNameInput(event)">
              </div>

              <!-- Email (Read-Only Info Display) -->
              <div class="space-y-1.5">
                <label for="email" class="block text-[13px] font-bold text-ink-body">
                  Alamat Email
                </label>
                <input id="email" name="email" type="email" readonly="" class="w-full h-11 px-4 bg-surface-neutral text-ink-muted text-[14px] rounded-xl outline-none border border-border-subtle cursor-not-allowed select-all" value="ahmad.hidayat@literasi.id">
              </div>

              <!-- Nomor WhatsApp / HP -->
              <div class="space-y-1.5">
                <label for="phone" class="block text-[13px] font-bold text-ink-body">
                  Nomor WhatsApp / HP
                </label>
                <input id="phone" name="phone" type="tel" class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" value="0812-3456-7890" oninput="handlePhoneInput(event)">
              </div>

              <!-- Kategori Bacaan Favorit (Interactive Selectable Tags) -->
              <div class="space-y-2 md:col-span-2 pt-2">
                <span class="block text-[13px] font-bold text-ink-body">
                  Kategori Bacaan Favorit
                </span>
                <div id="category-chips-container" class="flex flex-wrap gap-2">
                  <button type="button" class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs" data-category="Sastra &amp; Fiksi" onclick="toggleCategoryChip(this)">
                    Sastra &amp; Fiksi
                  </button>
                  <button type="button" class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs" data-category="Budaya &amp; Tradisi" onclick="toggleCategoryChip(this)">
                    Budaya &amp; Tradisi
                  </button>
                  <button type="button" class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs" data-category="Pendidikan" onclick="toggleCategoryChip(this)">
                    Pendidikan
                  </button>
                  <button type="button" class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-body hover:bg-surface-soft border border-border-subtle" data-category="Bisnis &amp; Ekonomi" onclick="toggleCategoryChip(this)">
                    Bisnis &amp; Ekonomi
                  </button>
                  <button type="button" class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-body hover:bg-surface-soft border border-border-subtle" data-category="Anak &amp; Remaja" onclick="toggleCategoryChip(this)">
                    Anak &amp; Remaja
                  </button>
                </div>
              </div>

            </div>

            <!-- Form Action Buttons -->
            <div class="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button type="button" class="h-11 px-5 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[14px] font-semibold transition-colors" onclick="handleProfileCancel()">
                Batal
              </button>
              <button id="btn-save-profile" type="submit" class="h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Perubahan</span>
              </button>
            </div>

          </form>

        </section>

      </div>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="toast-notification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toastIcon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toastMessage">Perubahan berhasil disimpan.</span>
    </div>
@endpush
