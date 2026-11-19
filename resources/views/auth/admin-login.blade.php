@extends('layouts.auth')

@section('title', 'Masuk Administrator — IKAPI Jawa Barat')

@section('content')
<div class="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-5 sm:px-6 sm:py-6">

  {{-- Auth card --}}
  <div class="grid flex-1 grid-cols-1 overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-sm lg:grid-cols-12">

    {{-- LEFT: dark visual panel with event image --}}
    <div class="relative hidden overflow-hidden bg-primary-deep lg:col-span-5 lg:block">
      <img src="{{ asset('assets/events/event-book-fair.jpg') }}" alt=""
        class="h-full w-full object-cover" aria-hidden="true">
    </div>

    {{-- RIGHT: form panel --}}
    <div class="col-span-1 flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7 lg:p-12">
      <div class="mx-auto w-full max-w-[400px]">

        <div class="space-y-1">
          <h1 class="text-[26px] font-bold leading-snug tracking-tight text-ink-body">Masuk Administrator</h1>
          <p class="text-[14px] text-ink-muted">Masuk untuk mengelola Portal Administrator IKAPI.</p>
        </div>

        {{-- Success banner --}}
        @if (session('status'))
          <div class="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800" role="status">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[19px] text-emerald-600">check_circle</span>
            <p class="flex-1 text-[13px] font-semibold">{{ session('status') }}</p>
          </div>
        @endif

        {{-- Feedback banner --}}
        @if ($errors->any())
          <div class="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700" id="feedback" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[19px]">error</span>
            <p class="flex-1 text-[13px] font-semibold" id="feedback-text">{{ $errors->first() }}</p>
            <button type="button" id="feedback-close" aria-label="Tutup pesan"
              class="focus-ring shrink-0 rounded text-red-400 hover:text-red-700"
              onclick="this.parentElement.remove()">
              <span class="material-symbols-outlined text-[17px]">close</span>
            </button>
          </div>
        @else
          <div id="feedback" class="mt-4 hidden items-start gap-2.5 rounded-xl border p-3.5" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[19px]" id="feedback-icon">error</span>
            <p class="flex-1 text-[13px] font-semibold" id="feedback-text">-</p>
            <button type="button" id="feedback-close" aria-label="Tutup pesan"
              class="focus-ring shrink-0 rounded text-ink-muted hover:text-ink-body"
              onclick="this.parentElement.classList.add('hidden'); this.parentElement.classList.remove('flex');">
              <span class="material-symbols-outlined text-[17px]">close</span>
            </button>
          </div>
        @endif

        <form id="admin-login-form" class="mt-5 space-y-4" method="POST" action="{{ route('admin.login.submit') }}" novalidate>
          @csrf

          {{-- Email --}}
          <div>
            <label for="admin-email" class="mb-1.5 block text-[13px] font-bold text-ink-body">Alamat Email</label>
            <div class="relative flex items-center">
              <span class="pointer-events-none absolute left-0 pl-3.5 text-ink-muted">
                <span class="material-symbols-outlined text-[19px]">alternate_email</span>
              </span>
              <input id="admin-email" name="email" type="email" autocomplete="username"
                placeholder="Email administrator"
                value="{{ old('email') }}"
                class="h-11 w-full rounded-xl border border-border-subtle bg-white pl-10 pr-4 text-[14px] text-ink-body outline-none transition-colors placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/20">
            </div>
            <p id="email-error" class="mt-1 hidden text-[12px] text-red-600">Alamat email wajib diisi.</p>
          </div>

          {{-- Password --}}
          <div>
            <label for="admin-password" class="mb-1.5 block text-[13px] font-bold text-ink-body">Kata Sandi</label>
            <div class="relative flex items-center">
              <span class="pointer-events-none absolute left-0 pl-3.5 text-ink-muted">
                <span class="material-symbols-outlined text-[19px]">key</span>
              </span>
              <input id="admin-password" name="password" type="password" autocomplete="current-password"
                placeholder="Masukkan kata sandi"
                class="h-11 w-full rounded-xl border border-border-subtle bg-white pl-10 pr-10 text-[14px] text-ink-body outline-none transition-colors placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/20">
              <button type="button" id="toggle-password" aria-label="Tampilkan kata sandi"
                class="focus-ring absolute right-2.5 rounded p-1 text-ink-muted transition-colors hover:text-ink-body">
                <span class="material-symbols-outlined text-[19px]" id="toggle-icon">visibility</span>
              </button>
            </div>
            <p id="password-error" class="mt-1 hidden text-[12px] text-red-600">Kata sandi wajib diisi.</p>
          </div>

          <div class="flex justify-end">
            <a href="{{ route('password.request') }}"
              class="focus-ring rounded text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover hover:underline">
              Lupa kata sandi?
            </a>
          </div>

          <button type="submit" id="submit-btn"
            class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
            <span id="submit-label">Masuk ke Dashboard</span>
            <span class="material-symbols-outlined text-[18px]" id="submit-icon">arrow_forward</span>
          </button>
        </form>

        {{-- Demo info --}}
        <details class="mt-4 rounded-xl border border-border-subtle bg-surface-neutral px-3.5 py-2.5 text-[12px]">
          <summary class="cursor-pointer font-semibold text-ink-muted">Akun Demo Administrator</summary>
          <div class="mt-2 space-y-1 text-ink-muted">
            <p>Email: <span class="font-semibold text-ink-body">admin@demo.ikapi.id</span></p>
            <p>Kata sandi: <span class="font-semibold text-ink-body">demo12345</span></p>
          </div>
        </details>

      </div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script>
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // Password toggle
  if ($('toggle-password')) {
    $('toggle-password').addEventListener('click', function () {
      var input = $('admin-password');
      var show  = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('toggle-icon').textContent = show ? 'visibility_off' : 'visibility';
      this.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    });
  }

  // Clear field errors on input
  ['admin-email', 'admin-password'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('input', function () {
      var err = id === 'admin-email' ? $('email-error') : $('password-error');
      if (err) err.classList.add('hidden');
    });
  });
})();
</script>
@endpush
