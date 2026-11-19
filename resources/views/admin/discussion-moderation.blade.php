{{--
  Moderasi diskusi komunitas: laporan topik/balasan (state buyer), drawer konteks induk, aksi moderasi.
  Source: docs/design/prototype-copy/admin/moderasi_diskusi_komunitas_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Moderasi Diskusi Komunitas - Portal Administrator IKAPI Jawa Barat')

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
  #review-drawer { transform: translateX(100%); transition: transform .24s ease; }
  #review-drawer.is-open { transform: translateX(0); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Moderasi Diskusi Komunitas</h1>
      <p class="mt-1 text-[14px] text-muted">Tinjau laporan topik dan balasan diskusi komunitas literasi.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-72 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="seed" role="menuitem" class="focus-ring flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">Muat contoh laporan demo</button>
        <button type="button" data-demo="clear" role="menuitem" class="focus-ring flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">Kosongkan laporan demo</button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Laporan asli dari halaman komunitas muncul di sini karena data demo disimpan di browser ini.</p>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
    <div class="inline-flex items-center gap-1 rounded-xl border border-border bg-white p-1" role="tablist" aria-label="Filter status laporan">
      <button type="button" id="tab-pending" role="tab" aria-selected="true" class="tab-btn focus-ring rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white">
        Menunggu Ditinjau <span class="num" id="count-pending">(0)</span>
      </button>
      <button type="button" id="tab-all" role="tab" aria-selected="false" class="tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
        Semua Laporan <span class="num" id="count-all">(0)</span>
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-[200px]">
        <label for="report-search" class="sr-only">Cari laporan</label>
        <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted">search</span>
        <input id="report-search" type="search" placeholder="Cari laporan..." class="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-[13.5px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      </div>
      <label for="type-filter" class="sr-only">Filter jenis konten</label>
      <select id="type-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option value="all">Semua Jenis Konten</option>
        <option value="topic">Topik</option>
        <option value="reply">Balasan</option>
      </select>
    </div>
  </div>

  <div class="overflow-x-auto rounded-2xl border border-border bg-white">
    <table class="w-full min-w-[860px] border-collapse text-left">
      <thead>
        <tr class="border-b border-divider bg-white text-[11px] uppercase tracking-[0.06em] text-muted">
          <th scope="col" class="px-4 py-3 font-bold">Konten</th>
          <th scope="col" class="px-4 py-3 font-bold">Komunitas</th>
          <th scope="col" class="px-4 py-3 font-bold">Alasan</th>
          <th scope="col" class="px-4 py-3 font-bold">Pelapor</th>
          <th scope="col" class="px-4 py-3 font-bold">Status</th>
          <th scope="col" class="px-4 py-3 pr-5 text-right font-bold">Aksi</th>
        </tr>
      </thead>
      <tbody id="report-rows" class="text-[13px]"></tbody>
    </table>
  </div>

  <p id="table-summary" class="mt-3 text-[12.5px] text-muted"></p>

  <div id="state-empty" class="mt-3 hidden rounded-2xl border border-border bg-white px-5 py-14 text-center">
    <p class="text-[15px] font-semibold text-ink">Tidak Ada Laporan</p>
    <p class="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">Laporan topik atau balasan komunitas akan muncul di sini setelah dikirim oleh pembeli.</p>
  </div>
@endsection

@push('overlays')
  <div id="drawer-scrim" class="fixed inset-0 z-[60] hidden bg-[#222225]/45"></div>

  <aside id="review-drawer" class="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-border bg-white shadow-[-16px_0_40px_rgba(34,34,37,0.12)] sm:max-w-[540px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
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
      <section>
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Konteks</h3>
        <dl class="mt-2 space-y-2 text-[13px]">
          <div class="flex justify-between gap-3"><dt class="text-muted">Komunitas</dt><dd class="text-right font-medium text-ink" id="detail-community">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Jenis konten</dt><dd class="text-right font-medium text-ink" id="detail-type">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Topik</dt><dd class="text-right font-medium text-ink" id="detail-topic">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Penulis</dt><dd class="text-right font-medium text-ink" id="detail-author">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Dilaporkan</dt><dd class="num text-right text-ink" id="detail-time">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Status laporan</dt><dd class="text-right font-semibold text-ink" id="detail-status">-</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-muted">Jumlah laporan konten ini</dt><dd class="num text-right text-ink" id="detail-report-count">-</dd></div>
        </dl>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Konten yang dilaporkan</h3>
        <p class="review-text mt-2 rounded-xl border border-border p-3.5 text-[13.5px] leading-relaxed text-ink" id="detail-content">-</p>
        <p id="detail-content-note" class="mt-1.5 hidden text-[12px] text-[#B42318]"></p>
      </section>

      <section id="context-block" class="hidden border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Konteks diskusi</h3>
        <p class="mt-1.5 text-[13px] font-semibold text-ink" id="context-topic-title">-</p>
        <p class="mt-1 line-clamp-4 text-[13px] leading-relaxed text-muted" id="context-topic-body">-</p>
        <div id="context-parent-reply" class="mt-2.5 hidden rounded-lg border border-border bg-neutral p-2.5 text-[12.5px] leading-relaxed">
          <span class="block font-semibold text-ink" id="context-parent-author">-</span>
          <span class="mt-0.5 block text-muted" id="context-parent-body">-</span>
        </div>
        <p class="mt-2 text-[12px] text-muted" id="context-other-replies"></p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Alasan pelaporan</h3>
        <p class="mt-1.5 text-[13.5px] font-semibold text-ink" id="detail-reason">-</p>
        <p class="mt-1.5 text-[13px] leading-relaxed text-muted" id="detail-details">Tidak ada keterangan tambahan.</p>
        <p class="mt-2 text-[12px] leading-relaxed text-muted">Alasan laporan bukan keputusan akhir. Periksa konteks sebelum menetapkan tindakan.</p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Keputusan</h3>
        <p class="mt-1.5 text-[13px] leading-relaxed text-ink" id="detail-decision">Belum ada keputusan.</p>
      </section>
    </div>

    <footer class="flex items-center justify-end gap-2 border-t border-divider px-5 py-3.5">
      <button type="button" id="btn-keep" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-50">Pertahankan</button>
      <button type="button" id="btn-remove" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[13.5px] font-semibold text-white hover:bg-[#971B13] disabled:cursor-not-allowed disabled:opacity-50">Hapus Konten</button>
    </footer>
  </aside>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P9 = { page: 'discussion-moderation' };
</script>
@endpush
