{{--
  Monitoring global: filter periode/penerbit, kartu ringkasan, grafik dan tabel transaksi dari fixture.
  Source: docs/design/prototype-copy/admin/monitoring_global_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Monitoring Global - Portal Administrator IKAPI Jawa Barat')

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
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Monitoring Global</h1>
      <p class="mt-1 text-[14px] text-muted">Pantau omzet, transaksi, dan aktivitas penerbit IKAPI Store.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Default: 14 Hari</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Filter: 7 Hari</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Filter: PT Mizan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Data Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Gagal Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Filters -->
  <section aria-labelledby="filter-title" class="mb-4 rounded-2xl border border-border bg-white p-5">
    <h2 id="filter-title" class="text-[15px] font-bold tracking-tight text-ink">Periode &amp; Filter</h2>
    <div class="mt-3 flex flex-wrap items-end gap-3">
      <div>
        <p class="mb-1.5 text-[12px] font-semibold text-muted">Rentang waktu</p>
        <div role="group" aria-label="Preset rentang waktu" class="flex items-center gap-1 rounded-xl border border-border bg-neutral p-1">
          <button type="button" data-preset="7" class="preset-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">7 Hari</button>
          <button type="button" data-preset="14" aria-pressed="true" class="preset-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">14 Hari</button>
          <button type="button" data-preset="30" class="preset-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">30 Hari</button>
          <button type="button" data-preset="month" class="preset-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">Bulan Ini</button>
        </div>
      </div>
      <div>
        <p class="mb-1.5 text-[12px] font-semibold text-muted">Tanggal</p>
        <p class="num h-10 rounded-xl border border-border bg-neutral px-3 text-[13px] leading-10 text-ink" id="date-range">01 Nov 2026 - 14 Nov 2026</p>
      </div>
      <div>
        <label for="publisher-filter" class="mb-1.5 block text-[12px] font-semibold text-muted">Penerbit</label>
        <select id="publisher-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <option value="all">Semua Penerbit</option>
        </select>
      </div>
      <button type="button" id="btn-reset" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Reset</button>
    </div>
    <p class="mt-3 text-[12px] leading-relaxed text-muted">Filter periode dan penerbit langsung memperbarui ringkasan, grafik, dan tabel di bawah.</p>
  </section>

  <!-- Error state -->
  <div id="view-error" class="mb-4 hidden rounded-2xl border border-border p-6">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-neutral text-ink">
          <span class="material-symbols-outlined text-[18px]">cloud_off</span>
        </span>
        <div>
          <h2 class="text-[16px] font-bold text-ink">Data Monitoring Tidak Dapat Dimuat</h2>
          <p class="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">Terjadi kendala saat mengambil data. Coba muat ulang.</p>
        </div>
      </div>
      <button type="button" id="btn-retry" class="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">refresh</span><span>Coba Lagi</span>
      </button>
    </div>
    <p id="retry-note" class="mt-3 hidden text-[12px] leading-relaxed text-muted">Pemuatan ulang disimulasikan pada prototype ini.</p>
  </div>

  <div id="view-data">

    <!-- KPI -->
    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Omzet</p>
        <p class="num mt-3 whitespace-nowrap text-[24px] font-bold leading-none tracking-tight text-ink" id="kpi-revenue">Rp 0</p>
        <p class="mt-3 text-[13px] text-muted" id="kpi-revenue-sub">Dari transaksi demo terfilter</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Transaksi</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-count">0</p>
        <p class="mt-3 text-[13px] text-muted">Baris transaksi demo terfilter</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Buku Aktif</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-books">56</p>
        <p class="mt-3 text-[13px] text-muted">Snapshot katalog, tidak mengikuti filter</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Penerbit Terdaftar</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-publishers">12</p>
        <p class="mt-3 text-[13px] text-muted">Snapshot akun, tidak mengikuti filter</p>
      </div>
    </div>

    <!-- Chart -->
    <section aria-labelledby="chart-title" class="mb-4 rounded-2xl border border-border bg-white p-5 lg:p-6">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="chart-title" class="text-[17px] font-bold tracking-tight text-ink">Tren Omzet Penjualan</h2>
          <p class="mt-0.5 text-[13px] text-muted">Perkembangan omzet berdasarkan periode dan penerbit terpilih.</p>
        </div>
        <p class="num text-[12.5px] text-muted" id="chart-peak"></p>
      </div>
      <div class="relative mt-4">
        <svg id="revenue-chart" viewBox="0 0 720 260" class="h-[260px] w-full" role="img" aria-labelledby="chart-title chart-desc"></svg>
        <div id="chart-tooltip" class="pointer-events-none absolute hidden rounded-xl border border-border bg-white px-3 py-2 text-[12px] shadow-[0_8px_24px_rgba(34,34,37,0.12)]">
          <p class="num font-semibold text-ink" id="tip-date">-</p>
          <p class="num mt-0.5 text-muted">Omzet <span class="font-semibold text-ink" id="tip-revenue">-</span></p>
          <p class="num text-muted">Transaksi <span class="font-semibold text-ink" id="tip-count">-</span></p>
        </div>
        <p id="chart-empty" class="absolute inset-0 hidden place-items-center text-center">
          <span class="text-[13px] text-muted">Tidak ada data omzet pada filter ini.</span>
        </p>
      </div>
      <p id="chart-desc" class="sr-only">Grafik garis omzet harian berdasarkan transaksi demo yang tersedia.</p>
    </section>

    <!-- Table -->
    <section aria-labelledby="table-title" class="rounded-2xl border border-border bg-white">
      <div class="flex flex-col gap-2 border-b border-divider p-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 id="table-title" class="text-[17px] font-bold tracking-tight text-ink">Monitoring Transaksi Terakhir</h2>
          <p class="mt-0.5 text-[13px] text-muted" id="table-sub">Transaksi demo yang tersedia</p>
        </div>
        <button type="button" id="btn-export" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink transition-colors hover:bg-neutral">
          <span class="material-symbols-outlined text-[18px]">download</span>
          <span>Ekspor CSV</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] border-collapse text-left">
          <caption class="sr-only">Daftar transaksi penjualan sesuai filter aktif</caption>
          <thead>
            <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" class="px-5 py-3 font-bold lg:px-6">Tanggal &amp; Waktu</th>
              <th scope="col" class="w-40 px-4 py-3 font-bold">ID Transaksi</th>
              <th scope="col" class="px-4 py-3 font-bold">Buku &amp; Penerbit</th>
              <th scope="col" class="w-44 px-4 py-3 font-bold">Metode Bayar</th>
              <th scope="col" class="w-32 px-4 py-3 text-right font-bold">Nominal</th>
              <th scope="col" class="w-28 px-4 py-3 pr-5 font-bold lg:pr-6">Status</th>
            </tr>
          </thead>
          <tbody id="tx-rows" class="text-[13px]"></tbody>
        </table>
      </div>

      <div id="state-empty" class="hidden px-5 py-14 text-center">
        <p class="text-[15px] font-semibold text-ink">Tidak Ada Transaksi Ditemukan</p>
        <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada transaksi yang sesuai dengan filter yang dipilih.</p>
        <button type="button" id="btn-reset-empty" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Reset Filter</button>
      </div>

      <div class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p class="text-[12.5px] text-muted" id="table-count">Menampilkan 0 dari 0 transaksi</p>
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
    </section>
  </div>
@endsection

@push('head')
<script>
  window.IKAPI_P9 = { page: 'monitoring' };
</script>
@endpush
