@extends('layouts.auth')

@section('title', 'Dashboard Penerbit — IKAPI Jawa Barat')

@section('content')
<div class="min-h-screen bg-surface-neutral text-ink-body antialiased w-full">
  <header class="border-b border-border-subtle bg-white">
    <div class="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold text-primary">IKAPI</span>
        <span class="text-[14px] font-semibold text-ink-muted">Portal Penerbit</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-[13px] font-semibold text-ink-body">{{ auth()->user()->name }}</span>
        <form method="POST" action="{{ route('logout') }}">
          @csrf
          <button type="submit" class="focus-ring rounded-lg border border-border-subtle px-3 py-1.5 text-[12px] font-semibold text-ink-muted hover:bg-surface-neutral hover:text-red-600">
            Keluar
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div class="rounded-2xl border border-border-subtle bg-white p-6 sm:p-8">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          AKUN DISETUJUI
        </span>
      </div>
      <h1 class="mt-4 text-[24px] font-bold text-ink-body">Selamat Datang di Portal Penerbit IKAPI</h1>
      <p class="mt-1 text-[14px] text-ink-muted leading-relaxed">
        Akun penerbit Anda telah terverifikasi dan aktif. Anda dapat mengelola katalog buku, memantau penjualan, dan melihat laporan pendapatan.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">menu_book</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Kelola Buku</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Daftar dan publikasikan e-book penerbit Anda.</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">payments</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Pendapatan</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Pantau royalti dan permohonan pencairan dana.</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">shopping_bag</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Pesanan Masuk</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Lihat riwayat pembelian buku dari pembaca.</p>
        </div>
      </div>
    </div>
  </main>
</div>
@endsection
