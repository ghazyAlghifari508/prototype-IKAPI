@extends('layouts.public')

{{--
  404 for missing slugs (e.g. /buku/tidak-ada). Uses the same public shell as the buyer pages and the
  illustration asset the prototype ships for exactly this purpose (docs/design/assets/ilustration/notfoundil.png).
  Copy is generic on purpose: the prototype never designed a 404 screen, so nothing is invented beyond a way back.
--}}
@section('title', 'Halaman tidak ditemukan — IKAPI Store Jawa Barat')

@section('content')
  <section class="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="mx-auto max-w-xl text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="Ilustrasi halaman tidak ditemukan" class="mx-auto h-40 w-auto object-contain">
      <h1 class="mt-6 text-[28px] sm:text-[34px] font-bold tracking-tight text-ink-body">Buku atau halaman ini tidak ditemukan</h1>
      <p class="mt-2 text-[15px] leading-relaxed text-ink-muted">
        Alamat yang kamu buka tidak cocok dengan buku mana pun di katalog. Periksa kembali tautannya atau mulai dari katalog.
      </p>
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a href="{{ route('books.index') }}" class="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[14px] font-bold text-white transition-colors hover:bg-primary-hover">Buka Katalog Buku</a>
        <a href="{{ route('home') }}" class="inline-flex h-11 items-center rounded-xl border border-border-subtle bg-white px-5 text-[14px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">Kembali ke Beranda</a>
      </div>
    </div>
  </section>
@endsection