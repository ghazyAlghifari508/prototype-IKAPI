{{--
  Moderasi ulasan & komentar produk: antrean laporan, drawer detail, hapus konten (simulasi).
  Source: docs/design/prototype-copy/admin/moderasi_ulasan_dan_komentar_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Moderasi Ulasan & Komentar - Portal Administrator IKAPI Jawa Barat')

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
  .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .review-text { white-space: pre-line; overflow-wrap: anywhere; }
  #publisher-sidebar { transform: translateX(-100%); transition: transform .22s ease; }
  #publisher-sidebar.is-open { transform: translateX(0); }
  @media (min-width: 1024px) { #publisher-sidebar { transform: none; transition: none; } }
  #mod-drawer { transform: translateX(100%); transition: transform .24s ease; }
  #mod-drawer.is-open { transform: translateX(0); }
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
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Moderasi Ulasan &amp; Komentar</h1>
      <p class="mt-1 text-[14px] text-muted">Periksa laporan pengguna dan kelola ulasan pembeli.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Laporan Masuk</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Semua Ulasan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Detail Moderasi</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Hapus</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Pertahankan Komentar</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Notifikasi Moderasi</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Antrean Bersih</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <p class="num mb-4 text-[13px] text-muted" id="queue-summary">3 laporan menunggu peninjauan</p>
  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Tabs -->
  <div role="tablist" aria-label="Kategori moderasi" class="mb-3 flex w-fit items-center gap-1 rounded-xl border border-border bg-neutral p-1">
    <button type="button" role="tab" data-tab="reported" aria-selected="true" class="tab-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">
      Dilaporkan <span class="tab-count num ml-0.5 font-semibold text-muted">(3)</span>
    </button>
    <button type="button" role="tab" data-tab="all" aria-selected="false" class="tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
      Semua Ulasan <span class="tab-count num ml-0.5 font-semibold">(3)</span>
    </button>
  </div>

  <p class="mb-3 text-[12px] leading-relaxed text-muted">Dilaporkan: laporan yang menunggu keputusan moderator. Semua Ulasan: seluruh ulasan pada dataset yang tersedia.</p>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative w-full lg:max-w-[320px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="mod-search" class="sr-only">Cari pengguna, buku, atau isi komentar</label>
      <input id="mod-search" type="search" autocomplete="off" placeholder="Cari pengguna, buku, atau komentar..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>
    <label for="category-filter" class="sr-only">Filter kategori laporan</label>
    <select id="category-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Kategori</option>
    </select>
    <label for="sort-order" class="sr-only">Urutan laporan</label>
    <select id="sort-order" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="newest">Laporan Terbaru</option>
      <option value="reporters">Pelapor Terbanyak</option>
      <option value="oldest">Terlama Menunggu</option>
    </select>
  </div>

  <!-- Queue -->
  <div id="queue" class="space-y-3"></div>

  <!-- Empty states -->
  <div id="state-queue-empty" class="hidden rounded-2xl border border-border px-5 py-14 text-center">
    <p class="text-[15px] font-semibold text-ink">Tidak Ada Laporan Menunggu</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Semua laporan dalam antrean ini telah ditinjau.</p>
  </div>

  <div id="state-noresults" class="hidden rounded-2xl border border-border px-5 py-12 text-center">
    <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" aria-hidden="true" class="mx-auto h-28 w-auto">
    <p class="mt-3 text-[15px] font-semibold text-ink">Tidak Ada Hasil</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada ulasan yang cocok dengan pencarian atau filter ini.</p>
    <button type="button" id="btn-reset-filter" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Bersihkan Filter</button>
  </div>

  <div id="state-nodata" class="hidden rounded-2xl border border-border px-5 py-14 text-center">
    <p class="text-[15px] font-semibold text-ink">Belum Ada Data Ulasan</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Dataset ulasan belum tersedia pada prototype ini.</p>
  </div>
@endsection

@push('overlays')
  <div id="drawer-scrim" class="fixed inset-0 z-[60] hidden bg-[#222225]/45"></div>

  <aside id="mod-drawer" class="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-border bg-white shadow-[-16px_0_40px_rgba(34,34,37,0.12)] sm:max-w-[540px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
    <header class="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
      <div class="min-w-0">
        <h2 id="drawer-title" class="text-[17px] font-bold tracking-tight text-ink">Tinjau Laporan</h2>
        <p class="num mt-0.5 text-[12.5px] text-muted" id="drawer-id">-</p>
      </div>
      <button type="button" id="drawer-close" aria-label="Tutup detail" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </header>

    <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <!-- A. Reported comment -->
      <section>
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Komentar yang Dilaporkan</h3>
        <p class="mt-1.5 text-[13px] font-semibold text-ink" id="drawer-user">-</p>
        <p class="num text-[12px] text-muted" id="drawer-time">-</p>
        <p class="review-text mt-2 rounded-xl border border-border p-3.5 text-[13.5px] leading-relaxed text-ink" id="drawer-comment">-</p>
        <p class="mt-2 text-[12px] leading-relaxed text-muted">Kategori laporan bukan keputusan akhir. Periksa konteks komentar sebelum mengambil tindakan.</p>
      </section>

      <!-- B. Book -->
      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Buku yang Diulas</h3>
        <div class="mt-2 flex items-start gap-3">
          <img id="drawer-cover" src="" alt="" class="h-20 w-14 shrink-0 rounded border border-border object-cover">
          <div class="min-w-0">
            <p class="text-[14px] font-semibold leading-snug text-ink" id="drawer-book">-</p>
            <p class="mt-0.5 text-[12.5px] text-muted" id="drawer-author">-</p>
            <p class="mt-0.5 text-[12.5px] text-muted" id="drawer-publisher">-</p>
            <p class="num mt-1 text-[12.5px] font-semibold text-ink" id="drawer-rating">-</p>
          </div>
        </div>
      </section>

      <!-- C. Report info -->
      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Informasi Laporan</h3>
        <dl class="mt-2 space-y-2 text-[13px]">
          <div class="flex justify-between gap-3"><dt class="text-muted">Kategori</dt><dd class="text-right font-medium text-ink" id="drawer-category">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Pelapor</dt><dd class="num text-ink" id="drawer-reporters">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Waktu laporan</dt><dd class="num text-right text-ink" id="drawer-reported-at">-</dd></div>
        </dl>
        <p class="mt-2 text-[13px] leading-relaxed text-muted" id="drawer-notes">Tidak ada catatan pelapor.</p>
      </section>

      <!-- D. Publisher response -->
      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Respons Penerbit</h3>
        <p class="mt-1.5 text-[13px] font-semibold text-ink" id="drawer-reply-publisher">-</p>
        <p class="review-text mt-1 text-[13px] leading-relaxed text-ink" id="drawer-reply">-</p>
        <p class="mt-1 text-[12px] text-muted" id="drawer-reply-empty">Belum ada respons penerbit untuk ulasan ini.</p>
      </section>

      <!-- E. Moderator decision -->
      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Keputusan Moderator</h3>
        <p class="mt-1.5 text-[13px] leading-relaxed text-muted">Keputusan mengubah status pada state prototype ini saja.</p>
        <p id="drawer-decision" class="mt-2 hidden text-[13px] font-semibold text-ink">-</p>
      </section>
    </div>

    <footer class="border-t border-divider px-5 py-3">
      <div class="flex items-center justify-end gap-2">
        <button type="button" id="btn-keep" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">Pertahankan</button>
        <button type="button" id="btn-delete" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[13.5px] font-semibold text-white hover:bg-[#971B13] disabled:cursor-not-allowed disabled:opacity-40">Hapus Komentar</button>
      </div>
    </footer>
  </aside>

  <div id="modal-delete" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-delete=""></div>
    <div class="relative mx-auto mt-24 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <h2 id="delete-title" class="text-[18px] font-bold tracking-tight text-ink">Hapus Komentar?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Komentar ini tidak akan ditampilkan lagi kepada pembaca setelah penghapusan.</p>
      <p class="mt-3 text-[13px] font-semibold text-ink" id="delete-user">-</p>
      <p class="text-[12.5px] text-muted" id="delete-book">-</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-delete="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-delete" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13] disabled:cursor-not-allowed disabled:opacity-60">
          <span id="delete-label">Hapus Komentar</span>
        </button>
      </div>
    </div>
  </div>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P9 = { page: 'review-moderation' };
</script>
@endpush
