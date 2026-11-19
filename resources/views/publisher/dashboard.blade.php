{{--
  Dashboard penerbit: KPI, grafik 30 hari, transaksi terbaru, state demo (normal/kosong/gagal analitik).
  Source: docs/design/prototype-copy/penerbit/dashboard_penerbit_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/dashboard.js
--}}

@extends('layouts.publisher')

@section('title', 'Dashboard Penerbit — IKAPI Jawa Barat')

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
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <!-- Page heading + actions -->
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Dashboard Penerbit</h1>
      <p class="mt-1 text-[14px] text-muted">Ringkasan aktivitas penerbitan buku, performa penjualan, dan saldo pencairan.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <a href="{{ route('publisher.payouts') }}" data-path="laporan-penjualan" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-neutral">
        <span class="material-symbols-outlined text-[18px]">summarize</span>
        <span>Laporan Penjualan</span>
      </a>
      <a href="{{ route('publisher.books') }}" data-path="tambah-buku" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Buku Baru</span>
      </a>
      <div class="relative">
        <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Mode Demo</span>
          <span class="material-symbols-outlined text-[17px]">expand_more</span>
        </button>
        <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-60 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih status data demo">
          <button type="button" data-demo-state="state-a" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Penerbit Baru (Kosong)</span>
            <span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo-state="state-b" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Penjualan Terisi</span>
            <span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo-state="state-c" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Sedang Memuat</span>
            <span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <button type="button" data-demo-state="state-d" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">
            <span>Analitik Bermasalah</span>
            <span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span>
          </button>
          <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi, tidak memuat data dari server.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ========== STATE C: SKELETON ========== -->
  <div id="view-state-c" class="hidden">
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="h-[132px] animate-pulse rounded-2xl border border-border bg-white p-5"><div class="h-3.5 w-24 rounded bg-neutral"></div><div class="mt-4 h-8 w-20 rounded bg-neutral"></div><div class="mt-4 h-3 w-40 rounded bg-neutral"></div></div>
      <div class="h-[132px] animate-pulse rounded-2xl border border-border bg-white p-5"><div class="h-3.5 w-24 rounded bg-neutral"></div><div class="mt-4 h-8 w-16 rounded bg-neutral"></div><div class="mt-4 h-3 w-36 rounded bg-neutral"></div></div>
      <div class="h-[132px] animate-pulse rounded-2xl border border-border bg-white p-5"><div class="h-3.5 w-32 rounded bg-neutral"></div><div class="mt-4 h-8 w-32 rounded bg-neutral"></div><div class="mt-4 h-3 w-44 rounded bg-neutral"></div></div>
      <div class="h-[132px] animate-pulse rounded-2xl border border-border bg-white p-5"><div class="h-3.5 w-28 rounded bg-neutral"></div><div class="mt-4 h-8 w-28 rounded bg-neutral"></div><div class="mt-4 h-3 w-40 rounded bg-neutral"></div></div>
    </div>
    <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="h-[340px] animate-pulse rounded-2xl border border-border bg-white p-5 lg:col-span-2">
        <div class="h-4 w-44 rounded bg-neutral"></div>
        <div class="mt-2 h-3 w-32 rounded bg-neutral"></div>
        <div class="mt-8 h-[220px] rounded-xl bg-neutral"></div>
      </div>
      <div class="h-[340px] animate-pulse rounded-2xl border border-border bg-white p-5">
        <div class="h-4 w-36 rounded bg-neutral"></div>
        <div class="mt-2 h-3 w-46 rounded bg-neutral"></div>
        <div class="mt-8 space-y-4">
          <div class="h-3 w-full rounded bg-neutral"></div>
          <div class="h-3 w-5/6 rounded bg-neutral"></div>
          <div class="h-3 w-4/5 rounded bg-neutral"></div>
          <div class="h-3 w-3/4 rounded bg-neutral"></div>
        </div>
      </div>
    </div>
    <div class="animate-pulse rounded-2xl border border-border bg-white p-5">
      <div class="h-4 w-52 rounded bg-neutral"></div>
      <div class="mt-5 h-9 w-full rounded bg-neutral"></div>
      <div class="mt-2 h-11 w-full rounded bg-neutral"></div>
      <div class="mt-2 h-11 w-full rounded bg-neutral"></div>
      <div class="mt-2 h-11 w-full rounded bg-neutral"></div>
    </div>
  </div>

  <!-- ========== MAIN DATA VIEW (STATE A / B, plus scoped error in STATE D) ========== -->
  <div id="view-data">

    <!-- KPI CARDS -->
    <div id="kpi-container" class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Buku Aktif</p>
        <p class="num mt-3 text-[30px] font-bold leading-none tracking-tight text-ink" id="kpi-books-val">4</p>
        <p class="mt-3 text-[13px] leading-snug text-muted" id="kpi-books-sub">4 judul terbit dari 5 judul di katalog</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Buku Terjual</p>
        <p class="num mt-3 text-[30px] font-bold leading-none tracking-tight text-ink" id="kpi-sold-val">103</p>
        <p class="mt-3 text-[13px] leading-snug text-muted" id="kpi-sold-sub">103 eksemplar terjual pada katalog</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Pendapatan Bersih</p>
        <p class="num mt-3 whitespace-nowrap text-[26px] font-bold leading-none tracking-tight text-ink" id="kpi-rev-val">Rp 1.485.000</p>
        <p class="mt-3 text-[13px] leading-snug text-muted" id="kpi-rev-sub">Akumulasi neto setelah bagi hasil platform</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Saldo Tersedia</p>
        <p class="num mt-3 whitespace-nowrap text-[26px] font-bold leading-none tracking-tight text-ink" id="kpi-bal-val">Rp 840.000</p>
        <p class="mt-3 text-[13px] leading-snug text-muted" id="kpi-bal-sub">Dapat diajukan untuk pencairan</p>
      </div>
    </div>

    <!-- ANALYTICS -->
    <div id="analytics-container" class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

      <!-- Sales trend -->
      <section aria-labelledby="chart-title" id="chart-panel" class="rounded-2xl border border-border bg-white p-5 lg:col-span-2 lg:p-6">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="chart-title" class="text-[17px] font-bold tracking-tight text-ink">Tren Penjualan E-Book</h2>
            <p class="mt-0.5 text-[13px] text-muted">Jumlah eksemplar digital terjual per hari</p>
          </div>
          <div role="group" aria-label="Pilih periode grafik" class="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-neutral p-1">
            <button type="button" data-period="7" disabled="" aria-disabled="true" title="Data demo hanya tersedia untuk 30 hari" class="period-btn focus-ring cursor-not-allowed rounded-lg px-3 py-1.5 text-[12px] font-semibold text-muted/60">7 Hari</button>
            <button type="button" data-period="30" aria-pressed="true" class="period-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-primary shadow-sm">30 Hari</button>
            <button type="button" data-period="90" disabled="" aria-disabled="true" title="Data demo hanya tersedia untuk 30 hari" class="period-btn focus-ring cursor-not-allowed rounded-lg px-3 py-1.5 text-[12px] font-semibold text-muted/60">90 Hari</button>
          </div>
        </div>

        <!-- Chart: empty (State A) -->
        <div id="chart-state-a" class="flex min-h-[240px] flex-col justify-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p class="text-[14px] font-semibold text-ink">Belum ada data penjualan pada periode ini</p>
          <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Penjualan akan tercatat otomatis setelah pembeli menyelesaikan pembayaran e-book.</p>
        </div>

        <!-- Chart: loaded (State B) -->
        <div id="chart-state-b" class="hidden">
          <div class="relative">
            <svg id="sales-chart" viewBox="0 0 680 220" class="h-[240px] w-full" role="img" aria-labelledby="chart-title chart-desc">
              <desc id="chart-desc">Grafik garis penjualan harian 30 hari data demo, total 148 eksemplar. Nilai tertinggi 11 eksemplar pada 26 November.</desc>
            </svg>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-3">
            <span class="flex items-center gap-1.5 text-[12px] text-muted">
              <span class="h-2 w-2.5 rounded-full bg-primary"></span>
              <span>Penjualan harian (eksemplar)</span>
            </span>
            <span class="text-[12px] text-muted">Data demo, 14 Nov 2026, 15:30 WIB</span>
          </div>
        </div>
      </section>

      <!-- Buyer evaluation -->
      <section aria-labelledby="eval-title" id="eval-panel" class="rounded-2xl border border-border bg-white p-5 lg:p-6">
        <div class="mb-4">
          <h2 id="eval-title" class="text-[17px] font-bold tracking-tight text-ink">Aktivitas Ulasan Pembeli</h2>
          <p class="mt-0.5 text-[13px] leading-snug text-muted">Ringkasan ulasan yang masuk pada katalog penerbit</p>
        </div>

        <!-- Review activity derived from Ulasan Pembeli -->
        <div id="eval-state-a" class="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p class="text-[14px] font-semibold text-ink">Belum ada ulasan</p>
          <p class="mx-auto mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-muted">Ulasan muncul setelah pembeli menyelesaikan bacaan.</p>
        </div>

        <div id="eval-state-b" class="hidden">
          <div id="eval-body" class="space-y-3"></div>
          <a href="{{ route('publisher.reviews') }}" class="focus-ring mt-4 inline-flex items-center gap-1 rounded text-[13px] font-semibold text-primary hover:text-primary-hover">
            <span>Lihat Ulasan Pembeli</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </section>

      <!-- Scoped analytics error (State D) -->
      <section id="analytics-error" class="hidden rounded-2xl border border-border bg-white p-6 lg:col-span-3">
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-neutral text-ink">
              <span class="material-symbols-outlined text-[18px]">cloud_off</span>
            </span>
            <div>
              <h2 class="text-[16px] font-bold text-ink">Analitik penjualan gagal dimuat</h2>
              <p class="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">Tren penjualan dan evaluasi pembeli tidak dapat diambil dari layanan analitik. Ringkasan buku, pendapatan, dan transaksi terakhir tetap ditampilkan.</p>
            </div>
          </div>
          <button type="button" id="btn-retry" class="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
            <span class="material-symbols-outlined text-[18px]">refresh</span>
            <span>Coba Muat Ulang</span>
          </button>
        </div>
      </section>
    </div>

    <p id="retry-note" class="mb-6 -mt-2 hidden text-[12px] leading-relaxed text-muted">Pemuatan ulang disimulasikan: dashboard kembali menampilkan data demo, bukan data baru dari server.</p>

    <!-- TRANSACTIONS -->
    <section aria-labelledby="table-title" id="table-container" class="rounded-2xl border border-border bg-white">
      <div class="flex flex-col gap-2 border-b border-divider p-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 id="table-title" class="text-[17px] font-bold tracking-tight text-ink">Transaksi Penjualan Terbaru</h2>
        </div>
        <a href="{{ route('publisher.orders') }}" data-path="lihat-semua-pesanan" class="focus-ring inline-flex items-center gap-1 rounded-lg text-[13px] font-semibold text-primary hover:text-primary-hover">
          <span>Lihat Semua Pesanan</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

      <!-- Empty -->
      <div id="table-state-a" class="px-5 py-12 text-center lg:px-6">
        <p class="text-[15px] font-semibold text-ink">Belum Ada Transaksi Penjualan</p>
        <p class="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">Transaksi penjualan akan muncul di sini setelah pembayaran terkonfirmasi.</p>
      </div>

      <!-- Filled -->
      <div id="table-state-b" class="hidden overflow-x-auto">
        <table class="w-full min-w-[820px] border-collapse text-left">
          <caption class="sr-only">Empat transaksi penjualan terbaru pada data demo</caption>
          <thead>
            <tr class="border-b border-border bg-neutral text-[11px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" class="whitespace-nowrap px-5 py-3 font-bold lg:px-6">No. Pesanan</th>
              <th scope="col" class="whitespace-nowrap px-4 py-3 font-bold">Tanggal &amp; Waktu</th>
              <th scope="col" class="px-4 py-3 font-bold">Judul Buku</th>
              <th scope="col" class="whitespace-nowrap px-4 py-3 font-bold">Format</th>
              <th scope="col" class="whitespace-nowrap px-4 py-3 text-right font-bold">Pendapatan Neto</th>
              <th scope="col" class="whitespace-nowrap px-4 py-3 pr-5 text-right font-bold lg:pr-6">Status Transaksi</th>
            </tr>
          </thead>
          <tbody class="text-[13px]">
            <tr class="border-b border-divider transition-colors hover:bg-soft">
              <td class="num whitespace-nowrap px-5 py-3.5 font-semibold text-primary lg:px-6">#ORD-2026-11082</td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-muted">14 Nov 2026, 14:25</td>
              <td class="px-4 py-3.5"><span class="block font-semibold text-ink">Laskar Aksara Pasundan</span><span class="block text-[12px] text-muted">Ayi R. Kurnia</span></td>
              <td class="whitespace-nowrap px-4 py-3.5"><span class="text-[12px] text-ink">E-Book</span></td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">Rp 241.200</td>
              <td class="whitespace-nowrap px-4 py-3.5 pr-5 text-right lg:pr-6"><span class="text-[12px] font-semibold text-[#0F7B4F]">Lunas</span></td>
            </tr>
            <tr class="border-b border-divider transition-colors hover:bg-soft">
              <td class="num whitespace-nowrap px-5 py-3.5 font-semibold text-primary lg:px-6">#ORD-2026-11045</td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-muted">13 Nov 2026, 10:12</td>
              <td class="px-4 py-3.5"><span class="block font-semibold text-ink">Pendidikan Karakter Sunda</span><span class="block text-[12px] text-muted">Dr. Cecep Hidayat</span></td>
              <td class="whitespace-nowrap px-4 py-3.5"><span class="text-[12px] text-ink">E-Book</span></td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">Rp 52.000</td>
              <td class="whitespace-nowrap px-4 py-3.5 pr-5 text-right lg:pr-6"><span class="text-[12px] font-semibold text-[#0F7B4F]">Lunas</span></td>
            </tr>
            <tr class="border-b border-divider transition-colors hover:bg-soft">
              <td class="num whitespace-nowrap px-5 py-3.5 font-semibold text-primary lg:px-6">#ORD-2026-10991</td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-muted">11 Nov 2026, 16:40</td>
              <td class="px-4 py-3.5"><span class="block font-semibold text-ink">Bumi Parahyangan: Jejak Purba</span><span class="block text-[12px] text-muted">T. Bachtiar</span></td>
              <td class="whitespace-nowrap px-4 py-3.5"><span class="text-[12px] text-ink">E-Book</span></td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">Rp 58.500</td>
              <td class="whitespace-nowrap px-4 py-3.5 pr-5 text-right lg:pr-6"><span class="text-[12px] font-semibold text-[#0F7B4F]">Lunas</span></td>
            </tr>
            <tr class="border-b border-divider transition-colors hover:bg-soft">
              <td class="num whitespace-nowrap px-5 py-3.5 font-semibold text-primary lg:px-6">#ORD-2026-10820</td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-muted">09 Nov 2026, 09:05</td>
              <td class="px-4 py-3.5"><span class="block font-semibold text-ink">Flora Priangan: Arsip Hayati</span><span class="block text-[12px] text-muted">Dr. Encep Kosasih</span></td>
              <td class="whitespace-nowrap px-4 py-3.5"><span class="text-[12px] text-ink">E-Book</span></td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">Rp 48.000</td>
              <td class="whitespace-nowrap px-4 py-3.5 pr-5 text-right lg:pr-6"><span class="text-[12px] font-semibold text-[#0F7B4F]">Lunas</span></td>
            </tr>
            <tr class="transition-colors hover:bg-soft">
              <td class="num whitespace-nowrap px-5 py-3.5 font-semibold text-primary lg:px-6">#ORD-2026-10764</td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-muted">07 Nov 2026, 19:32</td>
              <td class="px-4 py-3.5"><span class="block font-semibold text-ink">Laskar Aksara Pasundan</span><span class="block text-[12px] text-muted">Ayi R. Kurnia</span></td>
              <td class="whitespace-nowrap px-4 py-3.5"><span class="text-[12px] text-ink">E-Book</span></td>
              <td class="num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">Rp 40.500</td>
              <td class="whitespace-nowrap px-4 py-3.5 pr-5 text-right lg:pr-6"><span class="text-[12px] font-semibold text-[#0F7B4F]">Lunas</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
@endsection

@push('head')
<script>
  window.IKAPI_P8 = { page: 'dashboard' };
</script>
@endpush
