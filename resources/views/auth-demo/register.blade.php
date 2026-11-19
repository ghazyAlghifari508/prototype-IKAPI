{{--
  Buyer/publisher registration (demo, 2 roles).
  Source: docs/design/prototype-copy/user/daftar_akun_register_desktop.html (633 lines). Markup, classes, ids and copy are verbatim; only links,
  asset URLs and the shell come from the app. See docs/migration/p6-buyer-flows.md.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \Illuminate\Support\Facades\Route::has($name) ? route($name, $params) : '#';
@endphp

@extends('layouts.auth')

@push('head')
<style>
@layer utilities {
html, body { margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: clip; }
    .focus-ring:focus-visible { outline: 2px solid #673de6; outline-offset: 2px; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
}
</style>
@endpush

@section('title', 'Daftar Akun — IKAPI Jawa Barat')

@section('alt', 'Ilustrasi membaca e-book IKAPI Store')

@section('width', 'lg')

@section('content')
  <!-- Role tabs -->
  <div class="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-neutral p-1" role="tablist" aria-label="Pilih jenis akun">
    <button type="button" id="tab-buyer" role="tab" aria-selected="true" aria-controls="buyer-panel" class="role-tab focus-ring flex-1 rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-primary shadow-sm">Pembeli</button>
    <button type="button" id="tab-publisher" role="tab" aria-selected="false" aria-controls="publisher-panel" class="role-tab focus-ring flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-muted hover:text-ink-body">Penerbit</button>
  </div>

  <div class="space-y-1">
    <h1 id="auth-heading" class="text-[24px] sm:text-[26px] font-bold tracking-tight leading-snug text-ink-body">Buat Akun</h1>
    <p id="auth-description" class="text-[14px] text-ink-muted">Daftar untuk membeli dan membaca e-book di IKAPI Store.</p>
  </div>

  <!-- Error banner -->
  <div id="validation-banner" class="hidden items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700" role="alert">
    <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]">error</span>
    <p class="flex-1 text-[13px] font-semibold" id="error-title">Periksa kembali formulir</p>
    <button type="button" class="focus-ring rounded text-ink-muted hover:text-ink-body" aria-label="Tutup pesan" onclick="hideBanner()">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>

  <!-- Information banner (non-error feedback) -->
  <div id="info-banner" class="hidden items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-soft p-3.5" role="status">
    <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary">info</span>
    <p class="flex-1 text-[13px] font-semibold text-ink-body" id="info-text"></p>
    <button type="button" class="focus-ring rounded text-ink-muted hover:text-ink-body" aria-label="Tutup pesan" onclick="hideInfo()">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>

  <!-- ============ BUYER FORM (preserved from existing) ============ -->
  <form id="buyer-form" class="space-y-4" novalidate="">
    <div class="space-y-1.5">
      <label class="block text-[13px] font-bold text-ink-body" for="fullName">Nama Lengkap <span class="text-red-500">*</span></label>
      <input id="fullName" name="fullName" type="text" required="" placeholder="Contoh: Ahmad Hidayat" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
      <p class="hidden text-[12px] text-red-600" data-err="fullName">Nama lengkap wajib diisi.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="buyerEmail">Alamat Email <span class="text-red-500">*</span></label>
        <input id="buyerEmail" name="email" type="email" required="" placeholder="nama@email.com" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="buyerEmail">Masukkan format email yang benar.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="buyerPhone">Nomor WhatsApp / HP <span class="text-red-500">*</span></label>
        <input id="buyerPhone" name="phone" type="tel" required="" placeholder="0812-3456-7890" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="buyerPhone">Nomor WhatsApp / HP wajib diisi.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="buyerPassword">Kata Sandi <span class="text-red-500">*</span></label>
        <div class="relative flex items-center">
          <input id="buyerPassword" name="password" type="password" required="" minlength="8" placeholder="Minimal 8 karakter" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-4 pr-10 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
          <button type="button" data-toggle-pw="buyerPassword" aria-label="Tampilkan kata sandi" class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
            <span class="material-symbols-outlined text-[19px]">visibility</span>
          </button>
        </div>
        <p class="hidden text-[12px] text-red-600" data-err="buyerPassword">Kata sandi minimal 8 karakter.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="buyerPasswordConfirm">Konfirmasi Kata Sandi <span class="text-red-500">*</span></label>
        <div class="relative flex items-center">
          <input id="buyerPasswordConfirm" name="passwordConfirm" type="password" required="" minlength="8" placeholder="Ulangi kata sandi" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-4 pr-10 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
          <button type="button" data-toggle-pw="buyerPasswordConfirm" aria-label="Tampilkan konfirmasi kata sandi" class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
            <span class="material-symbols-outlined text-[19px]">visibility</span>
          </button>
        </div>
        <p class="hidden text-[12px] text-red-600" data-err="buyerPasswordConfirm">Konfirmasi kata sandi tidak sama.</p>
      </div>
    </div>

    <label class="flex items-start gap-2.5 select-none">
      <input id="buyerTerms" type="checkbox" required="" class="mt-0.5 h-4 w-4 cursor-pointer rounded border-border-subtle accent-primary text-primary">
      <span class="text-[13px] leading-relaxed text-ink-muted">
        Saya menyetujui <span class="font-semibold text-ink-body">Ketentuan Layanan</span> &amp;
        <span class="font-semibold text-ink-body">Kebijakan Privasi</span> IKAPI Store.
      </span>
    </label>
    <p class="hidden text-[12px] text-red-600" data-err="buyerTerms">Persetujuan ketentuan wajib dicentang.</p>

    <button type="submit" id="buyer-submit" class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
      <span data-btn-label="">Daftar</span>
      <span class="material-symbols-outlined text-[18px]" data-btn-icon="">arrow_forward</span>
    </button>
  </form>

  <!-- ============ PUBLISHER FORM (3 steps) ============ -->
  <form id="publisher-form" class="hidden space-y-4" novalidate="">
    <div>
      <p class="text-[12px] font-semibold text-ink-muted" id="step-label">Langkah 1 dari 3</p>
      <p class="mt-0.5 text-[14px] font-bold text-ink-body" id="step-title">Informasi Penerbit</p>
      <div class="mt-2.5 flex items-center gap-1.5" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="1" aria-label="Kemajuan pendaftaran penerbit" id="step-track">
        <span class="h-1.5 flex-1 rounded-full bg-surface-neutral" data-step-bar="1"></span>
        <span class="h-1.5 flex-1 rounded-full bg-surface-neutral" data-step-bar="2"></span>
        <span class="h-1.5 flex-1 rounded-full bg-surface-neutral" data-step-bar="3"></span>
      </div>
    </div>

    <!-- Step 1 -->
    <div class="space-y-4" data-step="1">
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubName">Nama Penerbit <span class="text-red-500">*</span></label>
        <input id="pubName" type="text" placeholder="Contoh: PT Penerbit Nusantara" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="pubName">Nama penerbit wajib diisi.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubMember">Nomor Anggota IKAPI <span class="text-red-500">*</span></label>
        <input id="pubMember" type="text" placeholder="Contoh: 041/JBA/2020" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="pubMember">Nomor anggota IKAPI wajib diisi.</p>
        <p class="text-[12px] text-ink-muted">Nomor anggota diperiksa oleh Sekretariat IKAPI, tidak diverifikasi otomatis.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubAddress">Alamat Penerbit <span class="text-red-500">*</span></label>
        <textarea id="pubAddress" rows="3" placeholder="Alamat kantor redaksi atau operasional penerbit lengkap dengan kota dan kode pos" class="w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 py-3 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]"></textarea>
        <p class="hidden text-[12px] text-red-600" data-err="pubAddress">Alamat penerbit wajib diisi.</p>
      </div>
    </div>

    <!-- Step 2 -->
    <div class="hidden space-y-4" data-step="2">
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubPic">Nama Penanggung Jawab <span class="text-red-500">*</span></label>
        <input id="pubPic" type="text" placeholder="Nama lengkap pimpinan atau perwakilan resmi" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="pubPic">Nama penanggung jawab wajib diisi.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubEmail">Email Kantor / Redaksi <span class="text-red-500">*</span></label>
        <input id="pubEmail" type="email" placeholder="redaksi@penerbit.co.id" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="pubEmail">Masukkan format email yang benar.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubPhone">Nomor WhatsApp / HP <span class="text-red-500">*</span></label>
        <input id="pubPhone" type="tel" placeholder="Contoh: 081234567890 atau 022-7204819" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
        <p class="hidden text-[12px] text-red-600" data-err="pubPhone">Nomor WhatsApp / HP wajib diisi.</p>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="hidden space-y-4" data-step="3">
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubPassword">Kata Sandi Portal <span class="text-red-500">*</span></label>
        <div class="relative flex items-center">
          <input id="pubPassword" type="password" placeholder="Minimal 8 karakter" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-4 pr-10 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
          <button type="button" data-toggle-pw="pubPassword" aria-label="Tampilkan kata sandi" class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
            <span class="material-symbols-outlined text-[19px]">visibility</span>
          </button>
        </div>
        <p class="hidden text-[12px] text-red-600" data-err="pubPassword">Kata sandi minimal 8 karakter.</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-ink-body" for="pubPasswordConfirm">Konfirmasi Kata Sandi <span class="text-red-500">*</span></label>
        <div class="relative flex items-center">
          <input id="pubPasswordConfirm" type="password" placeholder="Ulangi kata sandi" class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-4 pr-10 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
          <button type="button" data-toggle-pw="pubPasswordConfirm" aria-label="Tampilkan konfirmasi kata sandi" class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
            <span class="material-symbols-outlined text-[19px]">visibility</span>
          </button>
        </div>
        <p class="hidden text-[12px] text-red-600" data-err="pubPasswordConfirm">Konfirmasi kata sandi tidak sama.</p>
      </div>

      <label class="flex items-start gap-2.5 select-none">
        <input id="pubTerms" type="checkbox" class="mt-0.5 h-4 w-4 cursor-pointer rounded border-border-subtle accent-primary text-primary">
        <span class="text-[13px] leading-relaxed text-ink-muted">
          Saya menyatakan informasi penerbit yang diberikan benar dan menyetujui ketentuan pendaftaran Portal Penerbit.
        </span>
      </label>
      <p class="hidden text-[12px] text-red-600" data-err="pubTerms">Persetujuan ketentuan wajib dicentang.</p>
    </div>

    <!-- Step navigation -->
    <div class="flex items-center justify-between gap-2 pt-1">
      <button type="button" id="pub-back" class="focus-ring hidden h-11 items-center gap-1.5 rounded-xl border border-border-subtle px-4 text-[14px] font-semibold text-ink-body hover:bg-surface-neutral">
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Kembali</span>
      </button>
      <button type="button" id="pub-next" class="focus-ring ml-auto flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
        <span id="pub-next-label">Lanjutkan</span>
        <span class="material-symbols-outlined text-[18px]" id="pub-next-icon">arrow_forward</span>
      </button>
    </div>
  </form>

  <!-- Google sign-in (buyer only) -->
  <div id="google-block" class="space-y-4">
    <div class="relative flex items-center justify-center py-1">
      <div class="w-full border-t border-border-subtle"></div>
      <span class="absolute bg-white px-3 text-[12px] font-medium uppercase tracking-wider text-ink-muted">atau daftar dengan</span>
    </div>
    <button type="button" id="google-btn" class="focus-ring flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-white text-[14px] font-semibold text-ink-body transition-colors hover:bg-surface-soft">
      <svg aria-hidden="true" class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
        <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z" fill="#4285F4"></path>
        <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
        <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
        <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
      </svg>
      <span>Lanjutkan dengan Google</span>
    </button>
  </div>

  <div class="pt-1 text-center">
    <p class="text-[13px] text-ink-muted" id="switch-text">Sudah punya akun?</p>
    <a id="switch-link" class="focus-ring mt-1 inline-block rounded text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline" href="{{ $links('login') }}">Masuk</a>
  </div>

  <!-- Demo helpers (reviewer only) -->
  <details class="rounded-xl border border-border-subtle bg-surface-neutral px-3.5 py-2.5 text-[12px]" id="demo-block-buyer">
    <summary class="cursor-pointer font-semibold text-ink-muted">Mode Demo - Pembeli</summary>
    <div class="mt-2.5 space-y-2">
      <p class="text-ink-muted">Pratinjau status formulir pendaftaran pembeli.</p>
      <div class="flex flex-wrap gap-1.5" role="group" aria-label="Skenario demo pembeli">
        <button type="button" data-demo="default" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Default</button>
        <button type="button" data-demo="duplicate" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Email sudah terdaftar</button>
        <button type="button" data-demo="loading" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Sedang mengirim</button>
      </div>
    </div>
  </details>

  <details class="hidden rounded-xl border border-border-subtle bg-surface-neutral px-3.5 py-2.5 text-[12px]" id="demo-block-publisher">
    <summary class="cursor-pointer font-semibold text-ink-muted">Mode Demo - Penerbit</summary>
    <div class="mt-2.5 space-y-2">
      <p class="text-ink-muted">Pratinjau status formulir dan pengajuan penerbit.</p>
      <div class="flex flex-wrap gap-1.5" role="group" aria-label="Skenario demo penerbit">
        <button type="button" data-demo="default" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Default</button>
        <button type="button" data-demo="duplicate" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Email kantor sudah terdaftar</button>
        <button type="button" data-demo="loading" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Sedang mengirim</button>
        <button type="button" data-demo="success" class="demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body">Pengajuan terkirim</button>
      </div>
    </div>
  </details>

  <p class="text-center text-[12px] text-ink-muted">
    <a class="focus-ring rounded hover:underline" href="{{ $links('home') }}">Kembali ke Beranda</a>
  </p>
@endsection
