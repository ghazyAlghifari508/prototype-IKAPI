{{--
  Dashboard administrasi: KPI, antrean moderasi, aktivitas terbaru, state demo.
  Source: docs/design/prototype-copy/admin/dashboard_administrasi_utama_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Dashboard Administrator — IKAPI Jawa Barat')

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
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Dashboard Administrator</h1>
      <p class="mt-1 text-[14px] text-muted">Pantau kondisi platform dan pekerjaan yang perlu ditindaklanjuti.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-60 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Normal</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Antrean Bersih</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Data Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Gagal Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Error state (whole data area) -->
  <div id="view-error" class="hidden rounded-2xl border border-border p-6">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-neutral text-ink">
          <span class="material-symbols-outlined text-[18px]">cloud_off</span>
        </span>
        <div>
          <h2 class="text-[16px] font-bold text-ink">Data Dashboard Belum Dapat Dimuat</h2>
          <p class="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">Terjadi kendala saat memuat informasi operasional.</p>
        </div>
      </div>
      <button type="button" id="btn-retry" class="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">refresh</span><span>Coba Lagi</span>
      </button>
    </div>
    <p id="retry-note" class="mt-3 hidden text-[12px] leading-relaxed text-muted">Pemuatan ulang disimulasikan pada prototype ini.</p>
  </div>

  <!-- Loading -->
  <div id="view-loading" class="hidden" aria-hidden="true">
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="h-[128px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3 w-28 rounded bg-neutral"></div><div class="mt-4 h-8 w-32 rounded bg-neutral"></div><div class="mt-3 h-3 w-24 rounded bg-neutral"></div></div>
      <div class="h-[128px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3 w-32 rounded bg-neutral"></div><div class="mt-4 h-8 w-16 rounded bg-neutral"></div><div class="mt-3 h-3 w-24 rounded bg-neutral"></div></div>
      <div class="h-[128px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3 w-20 rounded bg-neutral"></div><div class="mt-4 h-8 w-14 rounded bg-neutral"></div><div class="mt-3 h-3 w-28 rounded bg-neutral"></div></div>
      <div class="h-[128px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3 w-28 rounded bg-neutral"></div><div class="mt-4 h-8 w-14 rounded bg-neutral"></div><div class="mt-3 h-3 w-24 rounded bg-neutral"></div></div>
    </div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="h-[320px] animate-pulse rounded-2xl border border-border lg:col-span-2"></div>
      <div class="h-[320px] animate-pulse rounded-2xl border border-border"></div>
    </div>
  </div>

  <!-- DATA VIEW -->
  <div id="view-data">

    <!-- KPI -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Omzet Penjualan</p>
        <p class="num mt-3 whitespace-nowrap text-[24px] font-bold leading-none tracking-tight text-ink" id="kpi-revenue">Rp 18.450.000</p>
        <p class="mt-3 text-[13px] text-muted">Total penjualan tercatat</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Pembayaran Berhasil</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-paid">142</p>
        <p class="mt-3 text-[13px] text-muted">Transaksi lunas</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Buku Aktif</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-books">56</p>
        <p class="mt-3 text-[13px] text-muted">Judul di katalog</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Penerbit Terdaftar</p>
        <p class="num mt-3 text-[28px] font-bold leading-none tracking-tight text-ink" id="kpi-publishers">12</p>
        <p class="mt-3 text-[13px] text-muted">Akun penerbit</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">

      <!-- Task queue -->
      <section aria-labelledby="queue-title" class="rounded-2xl border border-border bg-white lg:col-span-2">
        <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-divider px-5 py-4">
          <h2 id="queue-title" class="text-[17px] font-bold tracking-tight text-ink">Perlu Ditindaklanjuti</h2>
          <p class="num text-[12.5px] text-muted" id="queue-count">4 kategori, 5 item menunggu</p>
        </div>

        <ul id="queue-list" class="divide-y divide-divider"></ul>

        <div id="queue-empty" class="hidden px-5 py-12 text-center">
          <p class="text-[15px] font-semibold text-ink" id="queue-empty-title">Tidak Ada Pekerjaan Menunggu</p>
          <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted" id="queue-empty-desc">Semua pekerjaan dalam antrean saat ini telah ditangani.</p>
        </div>
      </section>

      <!-- Activity feed -->
      <section aria-labelledby="activity-title" class="rounded-2xl border border-border bg-white lg:col-span-1">
        <div class="border-b border-divider px-5 py-4">
          <h2 id="activity-title" class="text-[17px] font-bold tracking-tight text-ink">Aktivitas Platform</h2>
          <p class="mt-0.5 text-[12.5px] text-muted">Transaksi terbaru</p>
        </div>

        <ul id="activity-list" class="divide-y divide-divider"></ul>

        <div id="activity-empty" class="hidden px-5 py-12 text-center">
          <p class="text-[15px] font-semibold text-ink">Belum Ada Transaksi</p>
          <p class="mx-auto mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-muted">Transaksi akan muncul di sini setelah pembayaran tercatat.</p>
        </div>

        <div class="border-t border-divider px-5 py-3">
          <a href="{{ '/admin/monitoring' }}" class="focus-ring inline-flex items-center gap-1 rounded text-[13px] font-semibold text-primary hover:text-primary-hover">
            <span>Lihat Monitoring Global</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </section>
    </div>
  </div>
@endsection

@push('head')
<script>
  window.IKAPI_P9 = { page: 'dashboard' };
</script>
@endpush
