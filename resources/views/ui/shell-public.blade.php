@extends('layouts.public')

@section('title', 'Showcase shell publik - IKAPI Store Jawa Barat')
@section('account', request('akun') === 'member' ? 'member' : 'guest')
@section('cart_count', '2')

@section('content')
  <section class="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">P04 - showcase shell publik</p>
    <h1 class="mt-1 text-[34px] font-bold leading-tight tracking-tight text-ink-body">Header, main, dan footer publik</h1>
    <p class="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-ink-muted">
      Bukan halaman produk. Header dua tingkat (112px), nav utama, dan footer hitam disalin dari
      <code class="font-mono text-[13px]">user/beranda_desktop.html</code>. Tab navigasi yang rutenya belum terdaftar
      tampil sebagai teks nonaktif, bukan tautan.
    </p>
    <p class="mt-4 flex flex-wrap gap-3 text-[13px]">
      <a class="font-semibold text-primary hover:underline" href="{{ route('ui.shell.public') }}">Tamu</a>
      <a class="font-semibold text-primary hover:underline" href="{{ route('ui.shell.public', ['akun' => 'member']) }}">Anggota (dropdown akun)</a>
    </p>

    <div class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      @foreach (array_slice($books, 0, 4) as $book)
        <x-ikapi.book-card :book="$book" variant="shelf" />
      @endforeach
    </div>

    <div class="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      @foreach (array_slice($books, 0, 3) as $book)
        <x-ikapi.book-card :book="$book" variant="grid" />
      @endforeach
    </div>
  </section>
@endsection
