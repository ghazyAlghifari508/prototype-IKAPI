@extends('layouts.auth')

@section('title', 'Lupa Kata Sandi — IKAPI Jawa Barat')

@section('content')
<main class="w-full max-w-6xl mx-auto py-4">
  <div class="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-white border border-border-subtle">

    {{-- Left Illustration --}}
    <div class="hidden lg:flex lg:col-span-5 bg-white p-8 xl:p-12 items-center justify-center relative overflow-hidden">
      <div class="relative w-full max-w-[380px] flex items-center justify-center">
        <img src="{{ asset('assets/ilustration/auth_register_reading.png') }}" alt="Ilustrasi Pemulihan Akun IKAPI Store"
          class="w-full h-auto max-h-[460px] object-contain drop-shadow-sm select-none">
      </div>
    </div>

    {{-- Right Form Panel --}}
    <div class="col-span-1 lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
      <div class="max-w-md w-full mx-auto space-y-6">

        {{-- Header --}}
        <div class="space-y-1">
          <h1 class="text-[24px] sm:text-[26px] font-bold text-ink-body tracking-tight leading-snug">
            Lupa Kata Sandi?
          </h1>
          <p class="text-[14px] text-ink-muted">
            Masukkan email akun Anda untuk menerima tautan pengaturan ulang kata sandi.
          </p>
        </div>

        {{-- Success banner --}}
        @if (session('status'))
          <div class="p-3.5 rounded-2xl bg-surface-soft border border-primary/20 text-ink-body text-[13px] leading-relaxed" id="success-banner">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">mark_email_read</span>
              <div class="flex flex-col gap-0.5">
                <span class="font-bold text-ink-body">Periksa email Anda</span>
                <p class="text-ink-muted">{{ session('status') }}</p>
              </div>
            </div>
          </div>
        @else
          <div class="hidden p-3.5 rounded-2xl bg-surface-soft border border-primary/20 text-ink-body text-[13px] leading-relaxed" id="success-banner">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">mark_email_read</span>
              <div class="flex flex-col gap-0.5">
                <span class="font-bold text-ink-body">Periksa email Anda</span>
                <p class="text-ink-muted">Jika alamat email tersebut terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan ke kotak masuk Anda.</p>
              </div>
            </div>
          </div>
        @endif

        {{-- Error banner --}}
        @if ($errors->any())
          <div class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]">error</span>
            <p class="flex-1 text-[13px] font-semibold">{{ $errors->first() }}</p>
          </div>
        @endif

        {{-- Recovery Form --}}
        <form id="reset-password-form" class="space-y-4" method="POST" action="{{ route('password.email') }}">
          @csrf

          <div class="space-y-1.5">
            <label for="recovery-email" class="block text-[13px] font-bold text-ink-body">
              Alamat Email <span class="text-red-500">*</span>
            </label>
            <div class="relative flex items-center">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <span class="material-symbols-outlined text-[19px]">alternate_email</span>
              </div>
              <input autofocus
                class="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-neutral text-ink-body text-[14px] outline-none border border-border-subtle transition-all placeholder:text-ink-muted focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                id="recovery-email" name="email" placeholder="nama@email.com" required type="email"
                value="{{ old('email') }}">
            </div>
          </div>

          <button id="submit-btn"
            class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-ring"
            type="submit">
            <span id="submit-btn-text">Kirim Tautan</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {{-- Bottom links --}}
        <div class="pt-2 flex flex-col items-center gap-2 text-[13.5px]">
          <a href="{{ route('login', ['role' => request('role', 'buyer')]) }}"
            class="text-primary hover:text-primary-hover font-semibold inline-flex items-center gap-1.5 hover:underline focus-ring rounded">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Kembali ke Masuk</span>
          </a>
          <a href="{{ route('home') }}" class="text-[12.5px] text-ink-muted hover:text-primary transition-colors">
            Kembali ke Beranda
          </a>
        </div>

      </div>
    </div>
  </div>
</main>

{{-- Toast notification --}}
<div id="toast"
  class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-white/10">
  <span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
  <span id="toast-message">Permintaan berhasil diproses</span>
</div>
@endsection
