@extends('layouts.auth')

@section('title', 'Dashboard Administrator — IKAPI Jawa Barat')

@section('content')
<div class="min-h-screen bg-surface-neutral text-ink-body antialiased w-full">
  <header class="border-b border-border-subtle bg-white">
    <div class="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold text-primary">IKAPI</span>
        <span class="text-[14px] font-semibold text-ink-muted">Portal Administrator</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-[13px] font-semibold text-ink-body">{{ auth()->user()->name }}</span>
        <form method="POST" action="{{ route('admin.logout') }}">
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
        <span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
          <span class="material-symbols-outlined text-[16px]">shield_person</span>
          ADMINISTRATOR UTAMA
        </span>
      </div>
      <h1 class="mt-4 text-[24px] font-bold text-ink-body">Panel Administrasi IKAPI Store</h1>
      <p class="mt-1 text-[14px] text-ink-muted leading-relaxed">
        Selamat datang di pusat manajemen IKAPI Jawa Barat. Kelola persetujuan penerbit, pengawasan katalog, dan moderasi komunitas.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">domain</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Kelola Penerbit</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Tinjau dan setujui permohonan mitra penerbit baru.</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">group</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Kelola Pengguna</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Pantau data pengguna dan riwayat transaksi.</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-soft p-5">
          <span class="material-symbols-outlined text-[24px] text-primary">analytics</span>
          <h2 class="mt-2 text-[15px] font-bold text-ink-body">Monitoring Global</h2>
          <p class="mt-1 text-[13px] text-ink-muted">Statistik peredaran buku dan laporan pendapatan.</p>
        </div>
      </div>
    </div>
  </main>
</div>
@endsection
