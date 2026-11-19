@extends('layouts.auth')

@section('title', 'Atur Ulang Kata Sandi — IKAPI Jawa Barat')

@section('content')
<main class="w-full max-w-6xl mx-auto py-4">
  <div class="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-white border border-border-subtle">

    <div class="hidden lg:flex lg:col-span-5 bg-white p-8 xl:p-12 items-center justify-center overflow-hidden">
      <img src="{{ asset('assets/ilustration/auth_register_reading.png') }}" alt="Ilustrasi reset kata sandi IKAPI Store"
        class="w-full max-w-[380px] h-auto max-h-[460px] object-contain select-none">
    </div>

    <div class="col-span-1 lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
      <div class="w-full max-w-md mx-auto space-y-5">

        <div class="space-y-1">
          <h1 class="text-[24px] sm:text-[26px] font-bold tracking-tight leading-snug text-ink-body">Atur Ulang Kata Sandi</h1>
          <p class="text-[14px] text-ink-muted">Buat kata sandi baru yang aman untuk akun Anda.</p>
        </div>

        @if ($errors->any())
          <div class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700" role="alert">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]">error</span>
            <p class="flex-1 text-[13px] font-semibold">{{ $errors->first() }}</p>
          </div>
        @endif

        <form class="space-y-4" method="POST" action="{{ route('password.update') }}">
          @csrf
          <input type="hidden" name="token" value="{{ $token }}">

          <div class="space-y-1.5">
            <label class="block text-[13px] font-bold text-ink-body" for="email">Alamat Email <span class="text-red-500">*</span></label>
            <input id="email" name="email" type="email" required value="{{ old('email', $email ?? '') }}"
              class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
            @error('email')
              <p class="text-[12px] text-red-600">{{ $message }}</p>
            @enderror
          </div>

          <div class="space-y-1.5">
            <label class="block text-[13px] font-bold text-ink-body" for="password">Kata Sandi Baru <span class="text-red-500">*</span></label>
            <input id="password" name="password" type="password" required minlength="8" placeholder="Minimal 8 karakter"
              class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
            @error('password')
              <p class="text-[12px] text-red-600">{{ $message }}</p>
            @enderror
          </div>

          <div class="space-y-1.5">
            <label class="block text-[13px] font-bold text-ink-body" for="password_confirmation">Konfirmasi Kata Sandi Baru <span class="text-red-500">*</span></label>
            <input id="password_confirmation" name="password_confirmation" type="password" required minlength="8" placeholder="Ulangi kata sandi baru"
              class="h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
          </div>

          <button type="submit"
            class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover">
            <span>Simpan Kata Sandi Baru</span>
            <span class="material-symbols-outlined text-[18px]">lock_reset</span>
          </button>
        </form>

        <div class="pt-2 text-center">
          <a class="focus-ring inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline"
            href="{{ route('login') }}">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Halaman Masuk</span>
          </a>
        </div>

      </div>
    </div>
  </div>
</main>
@endsection
