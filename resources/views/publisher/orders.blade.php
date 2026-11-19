{{--
  Pesanan masuk: filter status, tabel pesanan, drawer detail pesanan (tanpa fulfillment nyata).
  Source: docs/design/prototype-copy/penerbit/pesanan_masuk_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/orders.js
--}}

@extends('layouts.publisher')

@section('title', 'Pesanan Masuk — Portal Penerbit IKAPI Jawa Barat')

@section('manual_shell', '1')

@push('head')
<style>
@layer utilities {
:root { --topbar-h: 64px; --sidebar-w: 248px; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #FFFFFF; color: #222225; }
  .shell-main { margin-left: 0; }
  @media (min-width: 1024px) { .shell-main { margin-left: var(--sidebar-w); } }
  .banner-bleed { margin-left: 0; }
  @media (min-width: 1024px) { .banner-bleed { margin-left: calc(-1 * var(--sidebar-w)); } }
  #publisher-sidebar { top: var(--topbar-h); }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .num { font-variant-numeric: tabular-nums; }
  .focus-ring:focus-visible { outline: 2px solid #673DE6; outline-offset: 2px; }
  .focus-ring-light:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  #publisher-sidebar { transform: translateX(-100%); transition: transform .22s ease; }
  #publisher-sidebar.is-open { transform: translateX(0); }
  @media (min-width: 1024px) { #publisher-sidebar { transform: none; transition: none; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <!-- Heading -->
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Pesanan Masuk</h1>
      <p class="mt-1 text-[14px] text-muted">Pantau transaksi penjualan e-book dan detail pesanan.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Pesanan Berisi</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Belum Ada Pesanan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Pencarian Nihil</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Menyiapkan Invoice</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Gagal Mengunduh Invoice</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sedang Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
    <div class="relative w-full sm:max-w-[360px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="order-search" class="sr-only">Cari nomor pesanan atau judul buku</label>
      <input id="order-search" type="search" autocomplete="off" placeholder="Cari nomor pesanan atau judul buku..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>
    <div>
      <label for="date-filter" class="sr-only">Rentang waktu pesanan</label>
      <select id="date-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option value="all">Semua Waktu</option>
        <option value="30d">30 Hari Terakhir</option>
        <option value="month">Bulan Ini</option>
      </select>
    </div>
  </div>

  <!-- Loading skeleton (State F) -->
  <div id="view-loading" class="hidden" aria-hidden="true">
    <div class="overflow-hidden rounded-2xl border border-border">
      <div class="h-11 animate-pulse border-b border-border"></div>
      <div class="divide-y divide-divider">
        <div class="flex items-center gap-4 p-4"><div class="h-3.5 w-32 animate-pulse rounded bg-neutral"></div><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-48 animate-pulse rounded bg-neutral"></div><div class="h-3 w-28 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-8 w-24 animate-pulse rounded bg-neutral"></div></div>
        <div class="flex items-center gap-4 p-4"><div class="h-3.5 w-32 animate-pulse rounded bg-neutral"></div><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-56 animate-pulse rounded bg-neutral"></div><div class="h-3 w-32 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-8 w-24 animate-pulse rounded bg-neutral"></div></div>
        <div class="flex items-center gap-4 p-4"><div class="h-3.5 w-32 animate-pulse rounded bg-neutral"></div><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-44 animate-pulse rounded bg-neutral"></div><div class="h-3 w-24 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-8 w-24 animate-pulse rounded bg-neutral"></div></div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div id="view-table" class="overflow-hidden rounded-2xl border border-border">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[900px] border-collapse text-left">
        <caption class="sr-only">Daftar pesanan e-book yang sudah dibayar beserta jumlah, pendapatan bersih, status, dan aksi</caption>
        <thead>
          <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
            <th scope="col" class="w-[190px] px-5 py-3 font-bold lg:px-6">Pesanan</th>
            <th scope="col" class="px-4 py-3 font-bold">Buku</th>
            <th scope="col" class="w-24 px-4 py-3 text-right font-bold">Jumlah</th>
            <th scope="col" class="w-36 px-4 py-3 text-right font-bold">Neto</th>
            <th scope="col" class="w-28 px-4 py-3 font-bold">Status</th>
            <th scope="col" class="w-[170px] px-4 py-3 pr-5 text-right font-bold lg:pr-6">Aksi</th>
          </tr>
        </thead>
        <tbody id="order-rows" class="text-[13px]"></tbody>
      </table>
    </div>

    <!-- Empty: dataset kosong (State B) -->
    <div id="state-empty" class="hidden px-5 py-14 text-center">
      <p class="text-[15px] font-semibold text-ink">Belum Ada Pesanan</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Pesanan yang telah berhasil dibayar akan muncul di sini.</p>
    </div>

    <!-- Empty: hasil filter kosong (State C) -->
    <div id="state-noresults" class="hidden px-5 py-12 text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" aria-hidden="true" class="mx-auto h-28 w-auto">
      <p class="mt-3 text-[15px] font-semibold text-ink">Pesanan Tidak Ditemukan</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada pesanan yang cocok dengan pencarian atau filter ini.</p>
      <button type="button" id="btn-reset-filter" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">
        Bersihkan Pencarian &amp; Filter
      </button>
    </div>

    <!-- Footer -->
    <div id="table-footer" class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <p class="text-[12.5px] text-muted" id="result-summary">Menampilkan 0 dari 0 pesanan</p>
      <div class="flex items-center gap-1.5">
        <button type="button" id="page-prev" aria-label="Halaman sebelumnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span class="num min-w-8 rounded-lg bg-primary px-2 py-1 text-center text-[12.5px] font-bold text-white" id="page-current">1</span>
        <button type="button" id="page-next" aria-label="Halaman berikutnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
@endsection

@push('overlays')
  <div id="modal-detail" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-detail=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div class="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 id="detail-title" class="text-[18px] font-bold tracking-tight text-ink">Detail Pesanan</h2>
          <p class="num mt-0.5 text-[13px] text-muted" id="detail-order">-</p>
          <p class="mt-0.5 text-[12.5px] text-muted" id="detail-date">-</p>
        </div>
        <button type="button" data-close-detail="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Buku dalam pesanan</p>
      <ul id="detail-items" class="mt-2 space-y-2"></ul>
      <p id="detail-items-note" class="mt-2 hidden text-[12px] leading-relaxed text-muted">Daftar judul lengkap belum tersedia pada dataset prototype ini.</p>

      <dl class="mt-4 space-y-2.5 border-t border-divider pt-4 text-[13px]">
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Total buku</dt><dd class="num font-semibold text-ink" id="detail-qty">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Pendapatan bersih</dt><dd class="num font-semibold text-ink" id="detail-net">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Status</dt><dd class="font-semibold text-ink" id="detail-status">-</dd></div>
      </dl>

      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-detail="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tutup</button>
        <a id="detail-invoice" href="{{ route('publisher.invoice') }}" target="_blank" rel="noopener" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Lihat Invoice</a>
      </div>
    </div>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P8 = { page: 'orders' };
</script>
@endpush
