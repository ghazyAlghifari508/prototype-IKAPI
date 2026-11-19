{{--
  Forgot password (demo, no email is sent).
  Source: docs/design/prototype-copy/user/lupa_kata_sandi_desktop.html (249 lines). Markup, classes, ids and copy are verbatim; only links,
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
        background-color: #f5f5f6;
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

@section('title', 'Lupa Kata Sandi — IKAPI Store Jawa Barat')

@section('alt', 'Ilustrasi Pemulihan Akun IKAPI Store')

@section('width', 'md')

@section('stack', 'space-y-6')

@section('image_wrap', '1')

@section('content')
  <!-- Header Copy -->
  <div class="space-y-1">
    <h1 class="text-[24px] sm:text-[26px] font-bold text-ink-body tracking-tight leading-snug">
      Lupa Kata Sandi?
    </h1>
    <p class="text-[14px] text-ink-muted">
      Masukkan email akun Anda untuk menerima tautan pengaturan ulang kata sandi.
    </p>
  </div>

  <!-- Feedback Notice (Triggered upon Submit) -->
  <div id="success-banner" class="hidden p-3.5 rounded-2xl bg-surface-soft border border-[#673de633] text-ink-body text-[13px] leading-relaxed">
    <div class="flex items-start gap-2.5">
      <span class="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">mark_email_read</span>
      <div class="flex flex-col gap-0.5">
        <span class="font-bold text-ink-body">Periksa email Anda</span>
        <p class="text-ink-muted">Jika alamat email tersebut terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan ke kotak masuk Anda.</p>
      </div>
    </div>
  </div>

  <!-- Recovery Form -->
  <form id="reset-password-form" class="space-y-4" onsubmit="handleResetSubmit(event)">

    <!-- Email Input -->
    <div class="space-y-1.5">
      <label for="recovery-email" class="block text-[13px] font-bold text-ink-body">
        Alamat Email <span class="text-red-500">*</span>
      </label>
      <div class="relative flex items-center">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
          <span class="material-symbols-outlined text-[19px]">alternate_email</span>
        </div>
        <input autofocus="" class="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-neutral text-ink-body text-[14px] outline-none border border-border-subtle transition-all placeholder:text-ink-muted focus:bg-white focus:border-primary focus:ring-2 focus:ring-[#673de633]" id="recovery-email" name="email" placeholder="nama@email.com" required="" type="email">
      </div>
    </div>

    <!-- Submit Action Button -->
    <button id="submit-btn" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer" type="submit">
      <span id="submit-btn-text">Kirim Tautan</span>
      <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
  </form>

  <!-- Bottom Links: Back to Login & Need Help -->
  <div class="pt-2 flex flex-col items-center gap-2 text-[13.5px]">
    <a id="back-to-login" href="{{ $links('login') }}" data-path="login" class="text-primary hover:text-primary-hover font-semibold inline-flex items-center gap-1.5 hover:underline">
      <span class="material-symbols-outlined text-[16px]">arrow_back</span>
      <span>Kembali ke Masuk</span>
    </a>
    <a href="{{ $links('help.chatbot') }}" data-path="bantuan" class="text-[12.5px] text-ink-muted hover:text-primary transition-colors">
      Butuh bantuan?
    </a>
  </div>
@endsection
