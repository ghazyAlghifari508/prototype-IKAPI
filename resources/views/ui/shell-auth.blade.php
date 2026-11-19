@extends('layouts.auth')

@section('title', 'Showcase shell autentikasi - IKAPI Store Jawa Barat')
@section('alt', 'Ilustrasi membaca IKAPI Store')

@section('content')
  <div class="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-neutral p-1" role="tablist" aria-label="Pilih jenis akun">
    <button type="button" role="tab" aria-selected="true" class="focus-ring flex-1 rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-primary shadow-sm">Pembeli</button>
    <button type="button" role="tab" aria-selected="false" class="focus-ring flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-muted hover:text-ink-body">Penerbit</button>
  </div>

  <div class="space-y-1">
    <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">P04 - showcase shell auth</p>
    <h1 class="text-[24px] sm:text-[26px] font-bold tracking-tight leading-snug text-ink-body">Selamat Datang Kembali</h1>
    <p class="text-[14px] text-ink-muted">Kartu 12 kolom: panel ilustrasi 5 + form 7, sama seperti halaman masuk.</p>
  </div>

  <form class="space-y-4" onsubmit="return false">
    <x-ikapi.form-field name="email" label="Alamat Email" type="email" icon="alternate_email" placeholder="nama@email.com" required />
    <x-ikapi.form-field name="password" label="Kata Sandi" type="password" icon="key" placeholder="Masukkan kata sandi" required />
    <button type="button" class="focus-ring h-11 w-full rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover">Masuk</button>
  </form>
@endsection
