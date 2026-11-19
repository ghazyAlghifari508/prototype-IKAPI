{{--
  Ulasan pembeli: daftar ulasan, filter rating, balasan penerbit simulasi.
  Source: docs/design/prototype-copy/penerbit/ulasan_pembeli_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/reviews.js
--}}

@extends('layouts.publisher')

@section('title', 'Ulasan Pembeli — Portal Penerbit IKAPI Jawa Barat')

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
  .review-text { white-space: pre-line; overflow-wrap: anywhere; }
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
  <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Ulasan Pembeli</h1>
      <p class="mt-1 text-[14px] text-muted">Kelola ulasan buku dan tanggapi masukan pembaca.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Berisi (Default)</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Buka Balasan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Validasi Error</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sedang Mengirim</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Balasan Tersimpan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Ulasan Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Pencarian Nihil</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <!-- Operational summary -->
  <p class="num mb-4 text-[13px] text-muted" id="review-summary">4 ulasan, 2 belum dibalas, 50% respons</p>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div class="relative w-full lg:max-w-[360px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="review-search" class="sr-only">Cari judul buku, isi ulasan, atau nama pengulas</label>
      <input id="review-search" type="search" autocomplete="off" placeholder="Cari judul buku, isi ulasan, atau pengulas..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>

    <div role="group" aria-label="Filter status ulasan" class="flex w-fit items-center gap-1 rounded-xl border border-border bg-neutral p-1">
      <button type="button" data-filter="all" aria-pressed="true" class="filter-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">
        Semua <span class="filter-count num ml-0.5 font-semibold text-muted">(4)</span>
      </button>
      <button type="button" data-filter="unreplied" aria-pressed="false" class="filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
        Belum Dibalas <span class="filter-count num ml-0.5 font-semibold">(2)</span>
      </button>
      <button type="button" data-filter="replied" aria-pressed="false" class="filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
        Sudah Dibalas <span class="filter-count num ml-0.5 font-semibold">(2)</span>
      </button>
    </div>
  </div>

  <!-- Review list -->
  <div id="review-list" class="space-y-4"></div>

  <!-- State F: no reviews -->
  <div id="state-empty" class="hidden rounded-2xl border border-border px-5 py-14 text-center">
    <p class="text-[15px] font-semibold text-ink">Belum Ada Ulasan</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Ulasan pembeli akan muncul di sini.</p>
  </div>

  <!-- State G: search empty -->
  <div id="state-noresults" class="hidden rounded-2xl border border-border px-5 py-12 text-center">
    <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" aria-hidden="true" class="mx-auto h-28 w-auto">
    <p class="mt-3 text-[15px] font-semibold text-ink">Ulasan Tidak Ditemukan</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada ulasan yang cocok dengan pencarian atau filter ini.</p>
    <button type="button" id="btn-reset-filter" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">
      Bersihkan Filter
    </button>
  </div>
@endsection

@push('overlays')
  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[80] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P8 = { page: 'reviews' };
</script>
@endpush
