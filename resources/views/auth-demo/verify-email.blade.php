{{--
  Verify email notice (demo, no email is sent).
  Source: docs/design/prototype-copy/user/verifikasi_email_desktop.html (253 lines). Markup, classes, ids and copy are verbatim; only links,
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

@section('title', 'Verifikasi Email — IKAPI Store Jawa Barat')

@section('alt', 'Ilustrasi Verifikasi Email IKAPI Store')

@section('width', 'md')

@section('stack', 'space-y-6')

@section('image_wrap', '1')

@section('content')
  <!-- Heading -->
  <div class="space-y-1">
    <h1 class="text-[24px] sm:text-[26px] font-bold text-ink-body tracking-tight leading-snug">
      Cek Email untuk Verifikasi
    </h1>
    <p class="text-[14px] text-ink-muted">
      Kami sudah mengirimkan tautan verifikasi akun ke:
    </p>

    <!-- Dynamic Target Email Box -->
    <div class="pt-1.5">
      <div class="py-2 px-3.5 rounded-xl bg-surface-neutral border border-border-subtle inline-block max-w-full">
        <span id="user-email-display" class="font-bold text-[14px] text-ink-body break-all font-mono">
          pembeli@email.com
        </span>
      </div>
    </div>
  </div>

  <!-- Instruction -->
  <p class="text-[14px] text-ink-body leading-relaxed">
    Buka email tersebut dan klik tombol verifikasi untuk mengaktifkan akun dan mulai membaca di IKAPI Store.
  </p>

  <!-- Feedback Notice (Triggered upon Resend) -->
  <div id="resend-feedback" class="hidden p-3.5 rounded-2xl bg-surface-soft border border-[#673de633] text-ink-body text-[13px] leading-relaxed">
    <div class="flex items-start gap-2.5">
      <span class="material-symbols-outlined text-[19px] text-primary shrink-0 mt-0.5">mark_email_read</span>
      <span id="resend-feedback-text" class="text-ink-body font-medium">
        Tautan verifikasi baru berhasil dikirimkan ke email Anda.
      </span>
    </div>
  </div>

  <!-- Help Guidance -->
  <div class="pt-3 border-t border-border-subtle space-y-1 text-[13px] text-ink-muted">
    <p class="font-bold text-ink-body">Belum menerima email?</p>
    <p>Periksa folder spam atau promosi pada kotak masuk surel Anda.</p>
  </div>

  <!-- Action Buttons -->
  <div class="space-y-3 pt-1">
    <!-- Primary Action: Resend Verification Email -->
    <button id="resendBtn" type="button" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer" onclick="handleResendEmail()">
      <span class="material-symbols-outlined text-[18px]" id="resendIcon">refresh</span>
      <span id="resendText">Kirim Ulang Email</span>
    </button>

    <!-- Secondary Actions: Change Email & Back to Login -->
    <div class="flex items-center justify-between pt-1 text-[13px]">
      <a href="{{ $links('register') }}" data-path="register" class="text-primary hover:text-primary-hover font-semibold inline-flex items-center gap-1 hover:underline">
        <span>Ganti Email</span>
        <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
      </a>
      <a href="{{ $links('login') }}" data-path="login" class="text-ink-muted hover:text-primary transition-colors">
        Kembali ke Masuk
      </a>
    </div>
  </div>
@endsection
