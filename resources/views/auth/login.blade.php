@extends('layouts.auth')

@section('title', 'Masuk — IKAPI Jawa Barat')

@section('content')
<main class="w-full max-w-6xl mx-auto py-4">
  <div class="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-white border border-border-subtle">

    {{-- Illustration panel --}}
    <div class="hidden lg:flex lg:col-span-5 bg-white p-8 xl:p-12 items-center justify-center overflow-hidden">
      <img src="{{ asset('assets/ilustration/auth_register_reading.png') }}" alt="Ilustrasi membaca IKAPI Store"
        class="w-full max-w-[380px] h-auto max-h-[460px] object-contain select-none">
    </div>

    {{-- Form panel --}}
    <div class="col-span-1 lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
      <div class="w-full max-w-md mx-auto space-y-5">

        {{-- Role tabs --}}
        <div class="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-neutral p-1" role="tablist" aria-label="Pilih jenis akun">
          <button type="button" id="tab-buyer" role="tab" aria-selected="true" aria-controls="auth-panel"
            class="role-tab focus-ring flex-1 rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-primary shadow-sm">
            Pembeli
          </button>
          <button type="button" id="tab-publisher" role="tab" aria-selected="false" aria-controls="auth-panel"
            class="role-tab focus-ring flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-muted hover:text-ink-body">
            Penerbit
          </button>
        </div>

        <div class="space-y-1">
          <h1 class="text-[24px] sm:text-[26px] font-bold tracking-tight leading-snug text-ink-body" id="auth-heading">Selamat Datang Kembali</h1>
          <p class="text-[14px] text-ink-muted" id="auth-description">Masuk untuk melanjutkan membaca koleksi bukumu.</p>
        </div>

        {{-- Success banner (password reset, etc.) --}}
        @if (session('status'))
          <div class="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800" role="status">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-emerald-600">check_circle</span>
            <p class="flex-1 text-[13px] font-semibold">{{ session('status') }}</p>
          </div>
        @endif

        {{-- Error banner --}}
        @if ($errors->any())
          <div class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700" id="validation-banner" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]">error</span>
            <p class="flex-1 text-[13px] font-semibold" id="error-title">{{ $errors->first() }}</p>
            <button type="button" class="focus-ring text-red-400 hover:text-red-700" aria-label="Tutup pesan"
              onclick="this.parentElement.remove()">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        @endif

        {{-- Pending approval panel (shown after login attempt with pending status) --}}
        <div class="{{ session('pending_approval') ? 'block' : 'hidden' }} rounded-2xl border border-border-subtle bg-surface-soft p-5" id="pending-panel" role="status">
          <p class="flex items-center gap-2 text-[13px] font-semibold text-ink-muted">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">hourglass_top</span>
            <span>Menunggu persetujuan</span>
          </p>
          <h2 class="mt-2.5 text-[16px] font-bold text-ink-body">Pengajuan akun penerbit masih ditinjau</h2>
          <p class="mt-1 text-[13px] leading-relaxed text-ink-muted">Akses Dashboard Penerbit tersedia setelah pendaftaran disetujui oleh tim IKAPI.</p>
          <a href="{{ route('publisher.status.public') }}"
            class="focus-ring mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-primary text-[13.5px] font-semibold text-white hover:bg-primary-hover">
            Lihat Status Pengajuan
          </a>
          <button type="button" id="pending-back"
            onclick="document.getElementById('pending-panel').classList.add('hidden'); document.getElementById('auth-form').classList.remove('hidden'); document.getElementById('google-block').classList.remove('hidden');"
            class="focus-ring mt-2 h-10 w-full rounded-xl border border-border-subtle bg-white text-[13.5px] font-semibold text-ink-body hover:bg-surface-neutral">
            Kembali ke Formulir Masuk
          </button>
        </div>

        {{-- Login form --}}
        <form class="space-y-4 {{ session('pending_approval') ? 'hidden' : '' }}" id="auth-form" method="POST" action="{{ route('login') }}" novalidate>
          @csrf
          <input type="hidden" name="role" id="role-input" value="{{ old('role', request('role', 'buyer')) }}">

          {{-- Email --}}
          <div class="space-y-1.5">
            <label class="block text-[13px] font-bold text-ink-body" for="email-field">Alamat Email <span class="text-red-500">*</span></label>
            <div class="relative flex items-center">
              <span class="pointer-events-none absolute left-0 pl-3.5 text-ink-muted">
                <span class="material-symbols-outlined text-[19px]">alternate_email</span>
              </span>
              <input id="email-field" name="email" type="email" autocomplete="username" required placeholder="nama@email.com"
                value="{{ old('email') }}"
                aria-describedby="email-error-msg"
                class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-10 pr-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
            </div>
          </div>

          {{-- Password --}}
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[13px] font-bold text-ink-body" for="password-field">Kata Sandi <span class="text-red-500">*</span></label>
              <a id="forgot-link" class="focus-ring rounded text-[12px] font-semibold text-primary transition-colors hover:text-primary-hover hover:underline"
                href="{{ route('password.request') }}">Lupa kata sandi?</a>
            </div>
            <div class="relative flex items-center">
              <span class="pointer-events-none absolute left-0 pl-3.5 text-ink-muted">
                <span class="material-symbols-outlined text-[19px]">key</span>
              </span>
              <input id="password-field" name="password" type="password" autocomplete="current-password" required placeholder="Minimal 6 karakter"
                class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral pl-10 pr-10 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
              <button type="button" id="toggle-pw-btn" aria-label="Tampilkan kata sandi"
                class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
                <span class="material-symbols-outlined text-[19px]" id="pw-visibility-icon">visibility</span>
              </button>
            </div>
          </div>

          {{-- Remember me --}}
          <label class="flex items-center gap-2 text-[13px] select-none">
            <input type="checkbox" id="remember-device" name="remember" class="h-4 w-4 cursor-pointer rounded border-border-subtle accent-primary text-primary" checked>
            <span class="text-ink-muted">Ingat saya di peramban ini</span>
          </label>

          <button type="submit" id="submit-btn"
            class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
            <span id="submit-label">Masuk ke Akun</span>
            <span class="material-symbols-outlined text-[18px]" id="submit-icon">arrow_forward</span>
          </button>
        </form>

        {{-- Google sign-in (buyer only) --}}
        <div id="google-block" class="{{ session('pending_approval') ? 'hidden' : '' }} space-y-4">
          <div class="relative flex items-center justify-center py-1">
            <div class="w-full border-t border-border-subtle"></div>
            <span class="absolute bg-white px-3 text-[12px] font-medium uppercase tracking-wider text-ink-muted">atau masuk dengan</span>
          </div>
          <button type="button" id="google-btn"
            class="focus-ring flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-white text-[14px] font-semibold text-ink-body transition-colors hover:bg-surface-soft">
            <svg aria-hidden="true" class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>
        </div>

        {{-- Role-aware secondary navigation --}}
        <div class="pt-1 text-center">
          <p class="text-[13px] text-ink-muted" id="switch-text">Belum memiliki akun IKAPI Store?</p>
          <a id="switch-link" class="focus-ring mt-1 inline-block rounded text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline"
            href="{{ route('register', ['role' => 'buyer']) }}">Daftar Sekarang</a>
        </div>

        <p class="text-center text-[12px] text-ink-muted">
          <a class="focus-ring rounded hover:underline" href="{{ route('home') }}">Kembali ke Beranda</a>
        </p>

      </div>
    </div>
  </div>
</main>
@endsection

@push('scripts')
<script>
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var roleInput = $('role-input');
  var currentRole = roleInput ? roleInput.value : 'buyer';

  var ROLE_COPY = {
    buyer: {
      heading: 'Selamat Datang Kembali',
      description: 'Masuk untuk melanjutkan membaca koleksi bukumu.',
      cta: 'Masuk ke Akun',
      switchText: 'Belum memiliki akun IKAPI Store?',
      switchLabel: 'Daftar Sekarang',
      register: "{{ route('register', ['role' => 'buyer']) }}"
    },
    publisher: {
      heading: 'Masuk ke Portal Penerbit',
      description: 'Kelola buku dan pantau aktivitas penjualan.',
      cta: 'Masuk Portal Penerbit',
      switchText: 'Belum punya akun penerbit?',
      switchLabel: 'Daftar sebagai Penerbit',
      register: "{{ route('register', ['role' => 'publisher']) }}"
    }
  };

  function setRole(next) {
    currentRole = (next === 'publisher') ? 'publisher' : 'buyer';
    if (roleInput) roleInput.value = currentRole;
    var copy = ROLE_COPY[currentRole];
    var isBuyer = currentRole === 'buyer';

    if ($('auth-heading'))    $('auth-heading').textContent    = copy.heading;
    if ($('auth-description')) $('auth-description').textContent = copy.description;
    if ($('submit-label'))    $('submit-label').textContent    = copy.cta;
    if ($('switch-text'))     $('switch-text').textContent     = copy.switchText;
    if ($('switch-link'))     { $('switch-link').textContent = copy.switchLabel; $('switch-link').setAttribute('href', copy.register); }

    // Google block only for buyer
    var gb = $('google-block');
    if (gb) gb.classList.toggle('hidden', !isBuyer);

    paintTab($('tab-buyer'), isBuyer);
    paintTab($('tab-publisher'), !isBuyer);

    // Update URL without reload
    var url = new URL(window.location.href);
    url.searchParams.set('role', currentRole);
    window.history.replaceState({}, '', url);
  }

  function paintTab(btn, active) {
    if (!btn) return;
    btn.className = 'role-tab focus-ring flex-1 rounded-lg px-3 py-2 text-[13px] ' +
      (active ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-ink-muted hover:text-ink-body');
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  }

  if ($('tab-buyer'))     $('tab-buyer').addEventListener('click', function () { setRole('buyer'); });
  if ($('tab-publisher')) $('tab-publisher').addEventListener('click', function () { setRole('publisher'); });

  // Password visibility toggle
  if ($('toggle-pw-btn')) {
    $('toggle-pw-btn').addEventListener('click', function () {
      var input = $('password-field');
      var icon  = $('pw-visibility-icon');
      var show  = input.type === 'password';
      input.type = show ? 'text' : 'password';
      icon.textContent = show ? 'visibility_off' : 'visibility';
      this.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    });
  }

  // Google button — no OAuth in this version
  if ($('google-btn')) {
    $('google-btn').addEventListener('click', function () {
      alert('Login dengan Google belum tersedia saat ini.');
    });
  }

  // Init from URL param
  var params = new URLSearchParams(window.location.search);
  var initialRole = params.get('role') || (roleInput ? roleInput.value : 'buyer');
  setRole(initialRole);
})();
</script>
@endpush
