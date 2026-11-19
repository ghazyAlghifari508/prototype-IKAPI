{{--
  Kelola buku: tabel katalog, filter/sort/cari, drawer detail, form tambah/edit, konfirmasi unpublish.
  Source: docs/design/prototype-copy/penerbit/kelola_buku_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/books.js
--}}

@extends('layouts.publisher')

@section('title', 'Kelola Buku — Portal Penerbit IKAPI Jawa Barat')

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
  #publisher-sidebar { transform: translateX(-100%); transition: transform .22s ease; }
  #publisher-sidebar.is-open { transform: translateX(0); }
  @media (min-width: 1024px) { #publisher-sidebar { transform: none; transition: none; } }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <!-- Heading + actions -->
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Kelola Buku</h1>
      <p class="mt-1 text-[14px] text-muted">Kelola katalog e-book dan status publikasinya.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" id="btn-add" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Buku Baru</span>
      </button>
      <div class="relative">
        <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Mode Demo</span>
          <span class="material-symbols-outlined text-[17px]">expand_more</span>
        </button>
        <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-60 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
          <button type="button" data-demo="filled" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Katalog Berisi</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo="empty" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Katalog Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo="noresults" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Pencarian Nihil</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo="draft" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Filter Draft</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo="unpublish" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Modal Hentikan Publikasi</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo="loading" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Sedang Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toolbar: search + status filter -->
  <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div class="relative w-full lg:max-w-[360px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="book-search" class="sr-only">Cari judul atau penulis</label>
      <input id="book-search" type="search" autocomplete="off" placeholder="Cari judul atau penulis..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-[14px] text-ink placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>

    <div role="group" aria-label="Filter status publikasi" class="flex w-fit items-center gap-1 rounded-xl border border-border bg-neutral p-1" id="filter-group">
      <button type="button" data-filter="all" aria-pressed="true" class="filter-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">
        Semua <span class="filter-count num ml-0.5 font-semibold text-muted">(5)</span>
      </button>
      <button type="button" data-filter="published" aria-pressed="false" class="filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
        Terbit <span class="filter-count num ml-0.5 font-semibold">(4)</span>
      </button>
      <button type="button" data-filter="draft" aria-pressed="false" class="filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
        Draft <span class="filter-count num ml-0.5 font-semibold">(1)</span>
      </button>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Loading skeleton -->
  <div id="view-loading" class="hidden" aria-hidden="true">
    <div class="overflow-hidden rounded-2xl border border-border">
      <div class="h-11 animate-pulse border-b border-border bg-neutral"></div>
      <div class="divide-y divide-divider">
        <div class="flex items-center gap-4 p-4"><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-48 animate-pulse rounded bg-neutral"></div><div class="h-3 w-28 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-3.5 w-12 animate-pulse rounded bg-neutral"></div></div>
        <div class="flex items-center gap-4 p-4"><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-56 animate-pulse rounded bg-neutral"></div><div class="h-3 w-28 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-3.5 w-12 animate-pulse rounded bg-neutral"></div></div>
        <div class="flex items-center gap-4 p-4"><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-44 animate-pulse rounded bg-neutral"></div><div class="h-3 w-28 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-3.5 w-12 animate-pulse rounded bg-neutral"></div></div>
        <div class="flex items-center gap-4 p-4"><div class="h-14 w-10 animate-pulse rounded bg-neutral"></div><div class="flex-1 space-y-2"><div class="h-3.5 w-52 animate-pulse rounded bg-neutral"></div><div class="h-3 w-28 animate-pulse rounded bg-neutral"></div></div><div class="h-3.5 w-16 animate-pulse rounded bg-neutral"></div><div class="h-3.5 w-12 animate-pulse rounded bg-neutral"></div></div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div id="view-table" class="overflow-hidden rounded-2xl border border-border">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[820px] border-collapse text-left">
        <caption class="sr-only">Daftar e-book penerbit beserta harga, diskon, jumlah terjual, status publikasi, dan aksi</caption>
        <thead>
          <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
            <th scope="col" class="px-4 py-3 font-bold lg:px-5">Buku</th>
            <th scope="col" class="w-32 px-4 py-3 text-right font-bold">Harga</th>
            <th scope="col" class="w-24 px-4 py-3 text-right font-bold">Diskon</th>
            <th scope="col" class="w-24 px-4 py-3 text-right font-bold">Terjual</th>
            <th scope="col" class="w-28 px-4 py-3 font-bold">Status</th>
            <th scope="col" class="w-[120px] px-4 py-3 pr-5 text-right font-bold lg:pr-6">Aksi</th>
          </tr>
        </thead>
        <tbody id="book-rows" class="text-[13px]">
          <tr class="border-b border-divider align-middle transition-colors hover:bg-soft" data-id="BK-01" data-title="Laskar Aksara Pasundan" data-author="Ayi R. Kurnia" data-price="45000" data-discount="10" data-sold="42" data-status="published" data-cover="{{ asset('assets/ikapi/covers/laskar-aksara-pasundan.jpg') }}">
            <td class="px-4 py-3 lg:px-5">
              <div class="flex items-start gap-3">
                <img src="{{ asset('assets/ikapi/covers/laskar-aksara-pasundan.jpg') }}" alt="Sampul Laskar Aksara Pasundan" class="h-14 w-10 shrink-0 rounded border border-border object-cover">
                <div class="min-w-0">
                  <p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">Laskar Aksara Pasundan</p>
                  <p data-cell="author" class="mt-0.5 text-[12px] text-muted">Ayi R. Kurnia</p>
                </div>
              </div>
            </td>
            <td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink">Rp 45,000".replace(",",".")</td>
            <td data-cell="discount" class="num px-4 py-3 text-right text-muted">10%</td>
            <td data-cell="sold" class="num px-4 py-3 text-right text-ink">42</td>
            <td data-cell="status" class="px-4 py-3"><span class="text-[12px] font-semibold text-[#0F7B4F]">Terbit</span></td>
            <td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" class="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink" aria-label="Aksi untuk Laskar Aksara Pasundan" aria-haspopup="menu" aria-expanded="false" data-more="BK-01"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </td>
          </tr>
          <tr class="border-b border-divider align-middle transition-colors hover:bg-soft" data-id="BK-02" data-title="Pendidikan Karakter Sunda" data-author="Dr. Cecep Hidayat" data-price="52000" data-discount="15" data-sold="28" data-status="published" data-cover="{{ asset('assets/ikapi/covers/B02.jpg') }}">
            <td class="px-4 py-3 lg:px-5">
              <div class="flex items-start gap-3">
                <img src="{{ asset('assets/ikapi/covers/B02.jpg') }}" alt="Sampul Pendidikan Karakter Sunda" class="h-14 w-10 shrink-0 rounded border border-border object-cover">
                <div class="min-w-0">
                  <p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">Pendidikan Karakter Sunda</p>
                  <p data-cell="author" class="mt-0.5 text-[12px] text-muted">Dr. Cecep Hidayat</p>
                </div>
              </div>
            </td>
            <td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink">Rp 52,000".replace(",",".")</td>
            <td data-cell="discount" class="num px-4 py-3 text-right text-muted">15%</td>
            <td data-cell="sold" class="num px-4 py-3 text-right text-ink">28</td>
            <td data-cell="status" class="px-4 py-3"><span class="text-[12px] font-semibold text-[#0F7B4F]">Terbit</span></td>
            <td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" class="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink" aria-label="Aksi untuk Pendidikan Karakter Sunda" aria-haspopup="menu" aria-expanded="false" data-more="BK-02"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </td>
          </tr>
          <tr class="border-b border-divider align-middle transition-colors hover:bg-soft" data-id="BK-03" data-title="Bumi Parahyangan: Jejak Purba" data-author="T. Bachtiar" data-price="65000" data-discount="0" data-sold="19" data-status="published" data-cover="{{ asset('assets/ikapi/covers/B03.jpg') }}">
            <td class="px-4 py-3 lg:px-5">
              <div class="flex items-start gap-3">
                <img src="{{ asset('assets/ikapi/covers/B03.jpg') }}" alt="Sampul Bumi Parahyangan: Jejak Purba" class="h-14 w-10 shrink-0 rounded border border-border object-cover">
                <div class="min-w-0">
                  <p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">Bumi Parahyangan: Jejak Purba</p>
                  <p data-cell="author" class="mt-0.5 text-[12px] text-muted">T. Bachtiar</p>
                </div>
              </div>
            </td>
            <td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink">Rp 65,000".replace(",",".")</td>
            <td data-cell="discount" class="num px-4 py-3 text-right text-muted">—</td>
            <td data-cell="sold" class="num px-4 py-3 text-right text-ink">19</td>
            <td data-cell="status" class="px-4 py-3"><span class="text-[12px] font-semibold text-[#0F7B4F]">Terbit</span></td>
            <td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" class="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink" aria-label="Aksi untuk Bumi Parahyangan: Jejak Purba" aria-haspopup="menu" aria-expanded="false" data-more="BK-03"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </td>
          </tr>
          <tr class="border-b border-divider align-middle transition-colors hover:bg-soft" data-id="BK-04" data-title="Flora Priangan: Arsip Hayati" data-author="Dr. Encep Kosasih" data-price="48000" data-discount="0" data-sold="14" data-status="published" data-cover="{{ asset('assets/ikapi/covers/B05.jpg') }}">
            <td class="px-4 py-3 lg:px-5">
              <div class="flex items-start gap-3">
                <img src="{{ asset('assets/ikapi/covers/B05.jpg') }}" alt="Sampul Flora Priangan: Arsip Hayati" class="h-14 w-10 shrink-0 rounded border border-border object-cover">
                <div class="min-w-0">
                  <p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">Flora Priangan: Arsip Hayati</p>
                  <p data-cell="author" class="mt-0.5 text-[12px] text-muted">Dr. Encep Kosasih</p>
                </div>
              </div>
            </td>
            <td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink">Rp 48,000".replace(",",".")</td>
            <td data-cell="discount" class="num px-4 py-3 text-right text-muted">—</td>
            <td data-cell="sold" class="num px-4 py-3 text-right text-ink">14</td>
            <td data-cell="status" class="px-4 py-3"><span class="text-[12px] font-semibold text-[#0F7B4F]">Terbit</span></td>
            <td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" class="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink" aria-label="Aksi untuk Flora Priangan: Arsip Hayati" aria-haspopup="menu" aria-expanded="false" data-more="BK-04"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </td>
          </tr>
          <tr class="border-b border-divider align-middle transition-colors hover:bg-soft" data-id="BK-05" data-title="Tata Bahasa &amp; Morfologi Sunda Modern" data-author="Prof. Dr. Iskandar" data-price="58000" data-discount="0" data-sold="0" data-status="draft" data-cover="{{ asset('assets/ikapi/covers/B08.jpg') }}">
            <td class="px-4 py-3 lg:px-5">
              <div class="flex items-start gap-3">
                <img src="{{ asset('assets/ikapi/covers/B08.jpg') }}" alt="Sampul Tata Bahasa &amp; Morfologi Sunda Modern" class="h-14 w-10 shrink-0 rounded border border-border object-cover">
                <div class="min-w-0">
                  <p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">Tata Bahasa &amp; Morfologi Sunda Modern</p>
                  <p data-cell="author" class="mt-0.5 text-[12px] text-muted">Prof. Dr. Iskandar</p>
                </div>
              </div>
            </td>
            <td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink">Rp 58,000".replace(",",".")</td>
            <td data-cell="discount" class="num px-4 py-3 text-right text-muted">—</td>
            <td data-cell="sold" class="num px-4 py-3 text-right text-ink">0</td>
            <td data-cell="status" class="px-4 py-3"><span class="text-[12px] font-semibold text-muted">Draft</span></td>
            <td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" class="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink" aria-label="Aksi untuk Tata Bahasa &amp; Morfologi Sunda Modern" aria-haspopup="menu" aria-expanded="false" data-more="BK-05"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty states -->
    <div id="state-empty" class="hidden px-5 py-14 text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" class="mx-auto h-28 w-auto" aria-hidden="true">
      <p class="text-[15px] font-semibold text-ink">Belum Ada Buku</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Mulai tambahkan buku untuk mengelola katalog penerbit Anda.</p>
      <button type="button" data-action="add" class="focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span>Tambah Buku Baru</span>
      </button>
    </div>

    <div id="state-noresults" class="hidden px-5 py-14 text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" class="mx-auto h-28 w-auto" aria-hidden="true">
      <p class="text-[15px] font-semibold text-ink">Buku Tidak Ditemukan</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada buku yang cocok dengan pencarian atau filter yang dipilih.</p>
      <button type="button" id="btn-clear-all" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">
        Bersihkan Pencarian &amp; Filter
      </button>
    </div>

    <div id="state-draft-empty" class="hidden px-5 py-14 text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" class="mx-auto h-28 w-auto" aria-hidden="true">
      <p class="text-[15px] font-semibold text-ink">Tidak Ada Buku Draft</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Semua buku sudah diterbitkan. Buku baru akan muncul di sini sebagai draft.</p>
    </div>

    <!-- Pagination footer -->
    <div id="table-footer" class="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5">
      <p class="text-[12.5px] text-muted" id="result-summary">Menampilkan 0 dari 0 buku</p>
      <div class="flex items-center gap-1.5">
        <button type="button" id="page-prev" aria-label="Halaman sebelumnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink transition-colors hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span class="num min-w-8 rounded-lg bg-primary px-2 py-1 text-center text-[12.5px] font-bold text-white" id="page-current">1</span>
        <button type="button" id="page-next" aria-label="Halaman berikutnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink transition-colors hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
@endsection

@push('overlays')
  <div id="row-menu" class="fixed z-[60] hidden w-56 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.14)]" role="menu" aria-label="Aksi buku">
    <button type="button" id="menu-detail" role="menuitem" class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
      <span class="material-symbols-outlined text-[18px] text-muted">visibility</span>
      <span>Lihat Detail</span>
    </button>
    <button type="button" id="menu-edit" role="menuitem" class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
      <span class="material-symbols-outlined text-[18px] text-muted">edit</span>
      <span>Edit Buku</span>
    </button>
    <button type="button" id="menu-publish" role="menuitem" class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
      <span class="material-symbols-outlined text-[18px] text-muted">publish</span>
      <span>Terbitkan</span>
    </button>
    <button type="button" id="menu-unpublish" role="menuitem" class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
      <span class="material-symbols-outlined text-[18px] text-muted">visibility_off</span>
      <span>Hentikan Publikasi</span>
    </button>
  </div>

  <div id="modal-detail" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-detail=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-detail-title">
      <div class="mb-4 flex items-start justify-between gap-4">
        <h2 id="modal-detail-title" class="text-[18px] font-bold tracking-tight text-ink">Detail Buku</h2>
        <button type="button" data-close-detail="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex items-start gap-4">
        <img id="det-cover" src="" alt="" class="h-28 w-20 shrink-0 rounded border border-border object-cover">
        <div class="min-w-0">
          <p id="det-title" class="text-[15px] font-semibold leading-snug text-ink"></p>
          <p id="det-author" class="mt-0.5 text-[12.5px] text-muted"></p>
          <p id="det-status" class="mt-2 text-[12px] font-semibold text-muted"></p>
        </div>
      </div>

      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-divider pt-4 text-[13px]">
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">ID Buku</dt>
          <dd id="det-id" class="num mt-0.5 font-medium text-ink"></dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Terjual</dt>
          <dd id="det-sold" class="num mt-0.5 font-medium text-ink"></dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Harga</dt>
          <dd id="det-price" class="num mt-0.5 font-medium text-ink"></dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Diskon</dt>
          <dd id="det-discount" class="num mt-0.5 font-medium text-ink"></dd>
        </div>
        <div class="col-span-2">
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Harga setelah diskon</dt>
          <dd id="det-final" class="num mt-0.5 text-[14px] font-semibold text-ink"></dd>
        </div>
      </dl>

      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-detail="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tutup</button>
        <button type="button" id="det-edit" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Edit Buku</button>
      </div>
    </div>
  </div>

  <div id="modal-book" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-book=""></div>
    <div class="relative mx-auto mt-16 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:mt-24 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-book-title">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="modal-book-title" class="text-[18px] font-bold tracking-tight text-ink">Tambah Buku Baru</h2>
          <p class="mt-0.5 text-[13px] text-muted">Metadata katalog. Unggah berkas e-book tidak termasuk pada prototype ini.</p>
        </div>
        <button type="button" data-close-book="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <form id="book-form" novalidate="" class="space-y-3.5">
        <div>
          <label for="f-title" class="mb-1 block text-[12.5px] font-semibold text-ink">Judul buku</label>
          <input id="f-title" name="title" type="text" required="" maxlength="120" class="h-10 w-full rounded-xl border border-border px-3 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <p class="mt-1 hidden text-[12px] text-[#B42318]" data-error="title">Judul buku wajib diisi.</p>
        </div>
        <div>
          <label for="f-author" class="mb-1 block text-[12.5px] font-semibold text-ink">Penulis</label>
          <input id="f-author" name="author" type="text" required="" maxlength="80" class="h-10 w-full rounded-xl border border-border px-3 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <p class="mt-1 hidden text-[12px] text-[#B42318]" data-error="author">Nama penulis wajib diisi.</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-price" class="mb-1 block text-[12.5px] font-semibold text-ink">Harga (Rp)</label>
            <input id="f-price" name="price" type="number" min="1000" step="500" required="" class="num h-10 w-full rounded-xl border border-border px-3 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-error="price">Harga minimal Rp 1.000.</p>
          </div>
          <div>
            <label for="f-discount" class="mb-1 block text-[12.5px] font-semibold text-ink">Diskon (%)</label>
            <input id="f-discount" name="discount" type="number" min="0" max="90" step="1" value="0" class="num h-10 w-full rounded-xl border border-border px-3 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          </div>
        </div>
        <label class="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5">
          <input id="f-published" name="published" type="checkbox" class="h-4 w-4 rounded border-border text-primary focus:ring-primary/30">
          <span class="text-[13px] text-ink">Terbitkan langsung ke katalog</span>
        </label>

        <div class="mt-1 flex items-center justify-end gap-2 border-t border-divider pt-4">
          <button type="button" data-close-book="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
          <button type="submit" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Simpan</button>
        </div>
      </form>
    </div>
  </div>

  <div id="modal-unpublish" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-unpublish=""></div>
    <div class="relative mx-auto mt-24 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-unpublish-title">
      <div class="mb-3 flex items-start justify-between gap-4">
        <h2 id="modal-unpublish-title" class="text-[18px] font-bold tracking-tight text-ink">Hentikan Publikasi Buku?</h2>
        <button type="button" data-close-unpublish="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <p class="text-[13.5px] leading-relaxed text-ink" id="unpublish-body">Buku tidak akan ditampilkan dalam katalog publik.</p>
      <p class="mt-2 text-[13px] leading-relaxed text-muted">Pembeli yang sudah memiliki buku tetap dapat mengaksesnya.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-unpublish="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-unpublish" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13]">Hentikan Publikasi</button>
      </div>
    </div>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P8 = { page: 'books' };
</script>
@endpush
