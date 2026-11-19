{{--
  Masuk Administrator (demo). Bukan autentikasi nyata: tidak ada Laravel Auth, hashing, atau sesi server.
  Source: docs/design/prototype-copy/admin/login_administrator_desktop.html (298 baris), markup verbatim.
--}}

@extends('layouts.plain')

@section('title', 'Masuk Administrator - IKAPI Store Jawa Barat')

@section('body_class', 'min-h-screen antialiased')

@push('head')
<style>
@layer utilities {
html, body { margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #F5F5F6; color: #222225; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .focus-ring:focus-visible { outline: 2px solid #673DE6; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
}
</style>
@endpush

@section('content')
  <div class="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-5 sm:px-6 sm:py-6">

    <!-- Auth card -->
    <div class="grid flex-1 grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_1px_2px_rgba(34,34,37,0.05)] lg:grid-cols-12">

      <!-- LEFT: visual panel -->
      <div class="relative hidden overflow-hidden bg-primary-deep lg:col-span-5 lg:block">
        <img src="{{ asset('assets/ikapi/events/event-book-fair.jpg') }}" alt="" class="h-full w-full object-cover" aria-hidden="true">
      </div>

      <!-- RIGHT: form -->
      <div class="col-span-1 flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7 lg:p-12">
        <div class="mx-auto w-full max-w-[400px]">

          <div class="space-y-1">
            <h1 class="text-[26px] font-bold leading-snug tracking-tight text-ink">Masuk Administrator</h1>
            <p class="text-[14px] text-muted">Masuk untuk mengelola Portal Administrator IKAPI.</p>
          </div>

          <!-- Feedback banner -->
          <div id="feedback" class="mt-4 hidden items-start gap-2.5 rounded-xl border p-3.5" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[19px]" id="feedback-icon">error</span>
            <p class="flex-1 text-[13px] font-semibold" id="feedback-text">-</p>
            <button type="button" id="feedback-close" aria-label="Tutup pesan" class="focus-ring shrink-0 rounded text-muted hover:text-ink">
              <span class="material-symbols-outlined text-[17px]">close</span>
            </button>
          </div>

          <form id="admin-login-form" class="mt-5 space-y-4" novalidate="">
            <div>
              <label for="admin-email" class="mb-1.5 block text-[13px] font-bold text-ink">Alamat Email</label>
              <div class="relative flex items-center">
                <span class="pointer-events-none absolute left-0 pl-3.5 text-muted">
                  <span class="material-symbols-outlined text-[19px]">alternate_email</span>
                </span>
                <input id="admin-email" name="email" type="email" autocomplete="username" placeholder="Email administrator" class="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20">
              </div>
              <p id="email-error" class="mt-1 hidden text-[12px] text-[#B42318]">Alamat email wajib diisi.</p>
            </div>

            <div>
              <label for="admin-password" class="mb-1.5 block text-[13px] font-bold text-ink">Kata Sandi</label>
              <div class="relative flex items-center">
                <span class="pointer-events-none absolute left-0 pl-3.5 text-muted">
                  <span class="material-symbols-outlined text-[19px]">key</span>
                </span>
                <input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi" class="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20">
                <button type="button" id="toggle-password" aria-label="Tampilkan kata sandi" class="focus-ring absolute right-2.5 rounded p-1 text-muted transition-colors hover:text-ink">
                  <span class="material-symbols-outlined text-[19px]" id="toggle-icon">visibility</span>
                </button>
              </div>
              <p id="password-error" class="mt-1 hidden text-[12px] text-[#B42318]">Kata sandi wajib diisi.</p>
            </div>

            <div class="flex justify-end">
              <a href="../user/lupa_kata_sandi_desktop.html" class="focus-ring rounded text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover hover:underline">Lupa kata sandi?</a>
            </div>

            <button type="submit" id="submit-btn" class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
              <span id="submit-label">Masuk ke Dashboard</span>
              <span class="material-symbols-outlined text-[18px]" id="submit-icon">arrow_forward</span>
            </button>
          </form>

          <p id="access-blocked" class="mt-4 hidden rounded-xl border border-border bg-white px-3.5 py-3 text-[12.5px] leading-relaxed text-ink" role="status">
            Akun pembeli yang sedang aktif tidak dapat membuka Portal Administrator. Keluar dari akun pembeli terlebih dahulu.
          </p>

          <!-- Prototype note (auth backend not connected) -->
          <div id="preview-note" class="mt-4 hidden rounded-xl border border-border bg-white p-3.5">
            <p class="text-[12.5px] leading-relaxed text-ink">Autentikasi administrator belum terhubung ke backend pada prototype ini. Dashboard hanya dapat dibuka sebagai pratinjau.</p>
            <a href="{{ '/admin' }}" id="preview-dashboard-link" class="focus-ring mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-[12.5px] font-semibold text-ink hover:bg-neutral">
              <span>Buka Pratinjau Dashboard</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <!-- Reviewer scenario selector (prototype only) -->
          <details class="mt-4 rounded-xl border border-border bg-neutral px-3.5 py-2.5 text-[12px]">
            <summary class="cursor-pointer font-semibold text-muted">Mode Pratinjau</summary>
            <div class="mt-2 space-y-2">
              <p class="text-muted">Simulasi tampilan status form pada prototype, bukan autentikasi.</p>
              <div class="flex flex-wrap gap-1.5" role="group" aria-label="Skenario tampilan">
                <button type="button" data-scenario="default" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Default</button>
                <button type="button" data-scenario="validation" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Validasi</button>
                <button type="button" data-scenario="invalid" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Kredensial salah</button>
                <button type="button" data-scenario="loading" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Memuat</button>
                <button type="button" data-scenario="denied" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Akses ditolak</button>
                <button type="button" data-scenario="network" class="scenario-chip focus-ring rounded-lg border border-border bg-white px-2.5 py-1 font-semibold text-ink">Gangguan jaringan</button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
@endsection
