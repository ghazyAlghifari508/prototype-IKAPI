{{--
  Pengawasan katalog global: laporan buku, drawer detail, takedown dan penutupan laporan (simulasi).
  Source: docs/design/prototype-copy/admin/pengawasan_katalog_buku_global_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Pengawasan Katalog - Portal Administrator IKAPI Jawa Barat')

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
  #catalog-drawer { transform: translateX(100%); transition: transform .24s ease; }
  #catalog-drawer.is-open { transform: translateX(0); }
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
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Pengawasan Katalog</h1>
      <p class="mt-1 text-[14px] text-muted">Tinjau laporan buku dan kelola status publikasi katalog.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Laporan Buku</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Seluruh Katalog</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Detail Laporan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Nonaktifkan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Tutup Laporan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Notifikasi Sukses</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Antrean Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <p class="num mb-4 text-[13px] text-muted" id="report-counter">2 laporan perlu ditinjau</p>
  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Tabs -->
  <div role="tablist" aria-label="Kategori pengawasan" class="mb-3 flex w-fit items-center gap-1 rounded-xl border border-border bg-neutral p-1">
    <button type="button" role="tab" data-tab="reports" aria-selected="true" class="tab-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">
      Laporan Masalah Buku <span class="tab-count num ml-0.5 font-semibold text-muted">(2)</span>
    </button>
    <button type="button" role="tab" data-tab="catalog" aria-selected="false" class="tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
      Seluruh Katalog Penerbit <span class="tab-count num ml-0.5 font-semibold">(2)</span>
    </button>
  </div>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative w-full lg:max-w-[320px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="cat-search" class="sr-only">Cari judul, penulis, ISBN, atau penerbit</label>
      <input id="cat-search" type="search" autocomplete="off" placeholder="Cari judul, penulis, ISBN, atau penerbit..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>
    <label for="type-filter" class="sr-only">Filter jenis laporan</label>
    <select id="type-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Jenis Laporan</option>
    </select>
    <label for="publisher-filter" class="sr-only">Filter penerbit</label>
    <select id="publisher-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Penerbit</option>
    </select>
    <label for="sort-order" class="sr-only">Urutan</label>
    <select id="sort-order" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="newest">Laporan Terbaru</option>
      <option value="oldest">Laporan Terlama</option>
      <option value="title">Judul A-Z</option>
    </select>
    <button type="button" id="btn-reset" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Reset Filter</button>
  </div>

  <!-- Reports table -->
  <div id="view-reports">
    <div class="overflow-hidden rounded-2xl border border-border">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[940px] border-collapse text-left">
          <caption class="sr-only">Daftar laporan masalah buku</caption>
          <thead>
            <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" class="px-5 py-3 font-bold lg:px-6">Buku</th>
              <th scope="col" class="w-52 px-4 py-3 font-bold">Penerbit</th>
              <th scope="col" class="w-44 px-4 py-3 font-bold">Jenis Laporan</th>
              <th scope="col" class="w-32 px-4 py-3 font-bold">Tanggal</th>
              <th scope="col" class="w-32 px-4 py-3 font-bold">Status</th>
              <th scope="col" class="w-28 px-4 py-3 pr-5 text-right font-bold lg:pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody id="report-rows" class="text-[13px]"></tbody>
        </table>
      </div>

      <div id="reports-empty" class="hidden px-5 py-14 text-center">
        <p class="text-[15px] font-semibold text-ink">Tidak Ada Laporan Menunggu</p>
        <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Semua laporan buku pada antrean ini telah ditinjau.</p>
      </div>

      <div id="reports-noresults" class="hidden px-5 py-12 text-center">
        <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" aria-hidden="true" class="mx-auto h-28 w-auto">
        <p class="mt-3 text-[15px] font-semibold text-ink">Laporan Tidak Ditemukan</p>
        <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada laporan yang cocok dengan pencarian atau filter.</p>
        <button type="button" id="btn-reset-empty" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Bersihkan Filter</button>
      </div>

      <div class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p class="text-[12.5px] text-muted" id="reports-count">Menampilkan 0 dari 0 laporan</p>
        <div class="flex items-center gap-1.5">
          <button type="button" id="rep-prev" aria-label="Halaman sebelumnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span class="num min-w-8 rounded-lg bg-primary px-2 py-1 text-center text-[12.5px] font-bold text-white" id="rep-page">1</span>
          <button type="button" id="rep-next" aria-label="Halaman berikutnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Catalog table -->
  <div id="view-catalog" class="hidden">
    <div class="overflow-hidden rounded-2xl border border-border">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[940px] border-collapse text-left">
          <caption class="sr-only">Katalog buku pada platform</caption>
          <thead>
            <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" class="px-5 py-3 font-bold lg:px-6">Katalog Buku</th>
              <th scope="col" class="w-52 px-4 py-3 font-bold">Penerbit</th>
              <th scope="col" class="w-40 px-4 py-3 font-bold">Format &amp; Ukuran</th>
              <th scope="col" class="w-40 px-4 py-3 text-right font-bold">Harga &amp; Terjual</th>
              <th scope="col" class="w-32 px-4 py-3 font-bold">Status Katalog</th>
              <th scope="col" class="w-24 px-4 py-3 pr-5 text-right font-bold lg:pr-6">Opsi</th>
            </tr>
          </thead>
          <tbody id="catalog-rows" class="text-[13px]"></tbody>
        </table>
      </div>

      <div id="catalog-empty" class="hidden px-5 py-14 text-center">
        <p class="text-[15px] font-semibold text-ink">Data Katalog Belum Tersedia</p>
        <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Belum ada buku pada cakupan katalog ini.</p>
      </div>

      <div class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p class="text-[12.5px] text-muted" id="catalog-count">Menampilkan 0 dari 0 buku</p>
        <div class="flex items-center gap-1.5">
          <button type="button" id="cat-prev" aria-label="Halaman sebelumnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span class="num min-w-8 rounded-lg bg-primary px-2 py-1 text-center text-[12.5px] font-bold text-white" id="cat-page">1</span>
          <button type="button" id="cat-next" aria-label="Halaman berikutnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
@endsection

@push('overlays')
  <div id="drawer-scrim" class="fixed inset-0 z-[60] hidden bg-[#222225]/45"></div>

  <aside id="catalog-drawer" class="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-border bg-white shadow-[-16px_0_40px_rgba(34,34,37,0.12)] sm:max-w-[540px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
    <header class="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
      <div class="min-w-0">
        <h2 id="drawer-title" class="text-[17px] font-bold tracking-tight text-ink">Detail Laporan Buku</h2>
        <p class="num mt-0.5 text-[12.5px] text-muted" id="drawer-id">-</p>
      </div>
      <button type="button" id="drawer-close" aria-label="Tutup detail" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </header>

    <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <section>
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Informasi Buku</h3>
        <div class="mt-2 flex items-start gap-3">
          <div class="grid h-20 w-14 shrink-0 place-items-center rounded border border-border bg-neutral">
            <span class="material-symbols-outlined text-[20px] text-muted">menu_book</span>
          </div>
          <div class="min-w-0">
            <p class="text-[14px] font-semibold leading-snug text-ink" id="drawer-book">-</p>
            <p class="mt-0.5 text-[12.5px] text-muted" id="drawer-author">-</p>
            <p class="num mt-0.5 text-[12.5px] text-muted" id="drawer-isbn">-</p>
            <p class="mt-1 text-[12.5px] font-semibold text-ink" id="drawer-pub-status">-</p>
          </div>
        </div>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Penerbit</h3>
        <p class="mt-1.5 text-[13.5px] font-semibold text-ink" id="drawer-publisher">-</p>
        <p class="mt-0.5 text-[12.5px] text-muted" id="drawer-publisher-meta">-</p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Detail Laporan</h3>
        <dl class="mt-2 space-y-2 text-[13px]">
          <div class="flex justify-between gap-3"><dt class="text-muted">Jenis laporan</dt><dd class="text-right font-medium text-ink" id="drawer-type">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Dilaporkan</dt><dd class="num text-right text-ink" id="drawer-date">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Format berkas</dt><dd class="num text-right text-ink" id="drawer-format">-</dd></div>
          <div class="hidden justify-between gap-3" id="drawer-section-row"><dt class="text-muted">Bagian bermasalah</dt><dd class="num text-right text-ink" id="drawer-section">-</dd></div>
        </dl>
        <p class="mt-2 text-[12px] font-semibold text-muted">Keterangan pelapor</p>
        <p class="review-text mt-1 rounded-xl border border-border p-3.5 text-[13.5px] leading-relaxed text-ink" id="drawer-notes">-</p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Hasil Pemeriksaan</h3>
        <p class="mt-1.5 text-[13px] leading-relaxed text-muted">Periksa kesesuaian berkas e-book dan hak cipta pada laporan ini sebelum menutup laporan atau menonaktifkan buku.</p>
        <p id="drawer-decision" class="mt-2 hidden text-[13px] font-semibold text-ink">-</p>
      </section>
    </div>

    <footer class="border-t border-divider px-5 py-3">
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button type="button" id="btn-close-report" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">Tutup Laporan</button>
        <button type="button" id="btn-takedown" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[13.5px] font-semibold text-white hover:bg-[#971B13] disabled:cursor-not-allowed disabled:opacity-40">Nonaktifkan Buku</button>
      </div>
    </footer>
  </aside>

  <div id="modal-takedown" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-takedown=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="takedown-title">
      <h2 id="takedown-title" class="text-[18px] font-bold tracking-tight text-ink">Nonaktifkan Buku?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Buku ini akan dinonaktifkan dari katalog publik setelah tindakan dikonfirmasi.</p>
      <p class="mt-3 text-[13.5px] font-semibold text-ink" id="takedown-book">-</p>
      <p class="text-[12.5px] text-muted" id="takedown-publisher">-</p>
      <label for="takedown-reason" class="mt-3 block text-[12.5px] font-semibold text-ink">Alasan Penonaktifan <span class="text-red-500">*</span></label>
      <textarea id="takedown-reason" rows="3" placeholder="Jelaskan alasan penonaktifan..." class="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
      <p id="takedown-error" class="mt-1 hidden text-[12px] text-[#B42318]">Alasan penonaktifan wajib diisi.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-takedown="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-takedown" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13] disabled:cursor-not-allowed disabled:opacity-60">
          <span id="takedown-label">Nonaktifkan Buku</span>
        </button>
      </div>
    </div>
  </div>

  <div id="modal-close-report" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-report=""></div>
    <div class="relative mx-auto mt-24 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="close-report-title">
      <h2 id="close-report-title" class="text-[18px] font-bold tracking-tight text-ink">Tutup Laporan?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Laporan ini akan ditandai selesai tanpa perubahan pada status publikasi buku.</p>
      <p class="mt-3 text-[13px] font-semibold text-ink" id="close-book">-</p>
      <p class="num text-[12.5px] text-muted" id="close-reg">-</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-report="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-close-report" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Tutup Laporan</button>
      </div>
    </div>
  </div>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P9 = { page: 'catalog' };
</script>
@endpush
