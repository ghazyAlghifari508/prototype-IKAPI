{{--
  Pendapatan & pencairan: ringkasan saldo, riwayat pencairan, rekening, permintaan pencairan simulasi.
  Source: docs/design/prototype-copy/penerbit/pendapatan_dan_pencairan_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/finance.js
--}}

@extends('layouts.publisher')

@section('title', 'Pendapatan & Pencairan — Portal Penerbit IKAPI Jawa Barat')

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
  <!-- Heading + actions -->
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Pendapatan &amp; Pencairan</h1>
      <p class="mt-1 text-[14px] text-muted">Pantau pendapatan dan ajukan pencairan ke rekening terdaftar.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" id="btn-export" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-neutral">
        <span class="material-symbols-outlined text-[18px]">download</span>
        <span>Ekspor Rekap Royalti</span>
      </button>
      <div class="relative">
        <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Mode Demo</span>
          <span class="material-symbols-outlined text-[17px]">expand_more</span>
        </button>
        <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
          <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Saldo Tersedia (Default)</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Saldo Kosong</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Rekening Belum Ada</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Validasi Error</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sedang Mengajukan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sukses Konfirmasi</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Detail Pencairan (Selesai)</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="H" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Detail Pencairan (Proses)</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <button type="button" data-demo="I" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Gagal Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
          <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
        </div>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Loading skeleton -->
  <div id="view-loading" class="hidden" aria-hidden="true">
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div class="h-[132px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3.5 w-28 rounded bg-neutral"></div><div class="mt-4 h-8 w-32 rounded bg-neutral"></div><div class="mt-4 h-3 w-40 rounded bg-neutral"></div></div>
      <div class="h-[132px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3.5 w-24 rounded bg-neutral"></div><div class="mt-4 h-8 w-28 rounded bg-neutral"></div><div class="mt-4 h-3 w-36 rounded bg-neutral"></div></div>
      <div class="h-[132px] animate-pulse rounded-2xl border border-border p-5"><div class="h-3.5 w-32 rounded bg-neutral"></div><div class="mt-4 h-8 w-24 rounded bg-neutral"></div><div class="mt-4 h-3 w-44 rounded bg-neutral"></div></div>
    </div>
    <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="h-[300px] animate-pulse rounded-2xl border border-border p-5 lg:col-span-2"><div class="h-4 w-40 rounded bg-neutral"></div><div class="mt-6 h-10 w-full rounded bg-neutral"></div><div class="mt-3 h-4 w-32 rounded bg-neutral"></div><div class="mt-10 h-10 w-full rounded bg-neutral"></div></div>
      <div class="h-[300px] animate-pulse rounded-2xl border border-border p-5"><div class="h-4 w-32 rounded bg-neutral"></div><div class="mt-5 space-y-3"><div class="h-3 w-full rounded bg-neutral"></div><div class="h-3 w-4/5 rounded bg-neutral"></div><div class="h-3 w-3/5 rounded bg-neutral"></div></div></div>
    </div>
    <div class="animate-pulse rounded-2xl border border-border p-5"><div class="h-4 w-52 rounded bg-neutral"></div><div class="mt-5 h-9 w-full rounded bg-neutral"></div><div class="mt-2 h-11 w-full rounded bg-neutral"></div><div class="mt-2 h-11 w-full rounded bg-neutral"></div></div>
  </div>

  <!-- Error state (State I) -->
  <div id="view-error" class="hidden rounded-2xl border border-border p-6">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-neutral text-ink">
          <span class="material-symbols-outlined text-[18px]">cloud_off</span>
        </span>
        <div>
          <h2 class="text-[16px] font-bold text-ink">Data Belum Dapat Dimuat</h2>
          <p class="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">Terjadi kendala saat memuat informasi pencairan.</p>
        </div>
      </div>
      <button type="button" id="btn-retry" class="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">refresh</span><span>Coba Lagi</span>
      </button>
    </div>
    <p id="retry-note" class="mt-3 hidden text-[12px] leading-relaxed text-muted">Pemuatan ulang disimulasikan pada prototype ini.</p>
  </div>

  <!-- MAIN DATA VIEW -->
  <div id="view-main">

    <!-- KPI -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Total Pendapatan Neto</p>
        <p class="num mt-3 whitespace-nowrap text-[26px] font-bold leading-none tracking-tight text-ink" id="kpi-net">Rp 1.485.000</p>
        <p class="mt-3 text-[13px] leading-snug text-muted">Akumulasi pendapatan neto penerbit</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Saldo Tersedia</p>
        <p class="num mt-3 whitespace-nowrap text-[26px] font-bold leading-none tracking-tight text-primary-deep" id="kpi-available">Rp 840.000</p>
        <p class="mt-3 text-[13px] leading-snug text-muted">Dapat diajukan untuk pencairan</p>
      </div>
      <div class="rounded-2xl border border-border bg-white p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Dalam Proses Transfer</p>
        <p class="num mt-3 whitespace-nowrap text-[26px] font-bold leading-none tracking-tight text-ink" id="kpi-pending">Rp 645.000</p>
        <p class="mt-3 text-[13px] leading-snug text-muted">Pengajuan yang sedang diproses</p>
      </div>
    </div>

    <!-- Form + bank account -->
    <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

      <!-- Withdrawal form -->
      <section aria-labelledby="form-title" class="rounded-2xl border border-border bg-white p-5 lg:col-span-2 lg:p-6">
        <h2 id="form-title" class="text-[17px] font-bold tracking-tight text-ink">Ajukan Pencairan Dana</h2>
        <p class="mt-0.5 text-[13px] text-muted">Masukkan nominal yang ingin dicairkan.</p>

        <form id="withdraw-form" class="mt-4 space-y-4" novalidate="">
          <div>
            <label for="input-nominal" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nominal Pencairan</label>
            <div class="relative flex items-center">
              <span class="pointer-events-none absolute left-3.5 text-[14px] font-medium text-muted">Rp</span>
              <input id="input-nominal" type="text" inputmode="numeric" autocomplete="off" placeholder="0" aria-describedby="nominal-error" class="num h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
            </div>
            <p id="nominal-error" class="mt-1 hidden text-[12px] text-[#B42318]"></p>
          </div>

          <div class="rounded-xl border border-border bg-white px-3.5 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Rekening tujuan</p>
                <p class="mt-1 text-[13px] font-semibold text-ink" id="bank-summary">Bank Central Asia (BCA), PT Kiblat Buku Utama, •••• 4892</p>
              </div>
              <a href="{{ route('publisher.settings') }}" class="focus-ring shrink-0 rounded text-[12.5px] font-semibold text-primary hover:text-primary-hover">Ubah</a>
            </div>
            <p id="bank-empty" class="mt-1 hidden text-[12.5px] text-muted">Rekening bank belum terdaftar. Tambahkan rekening pada Pengaturan Profil sebelum mengajukan pencairan.</p>
          </div>

          <label class="flex items-start gap-2.5 select-none">
            <input id="confirm-check" type="checkbox" class="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary text-primary">
            <span class="text-[13px] leading-relaxed text-ink">Saya telah memeriksa nominal dan rekening tujuan.</span>
          </label>
          <p id="confirm-error" class="hidden text-[12px] text-[#B42318]">Konfirmasi pemeriksaan wajib dicentang.</p>

          <button type="submit" id="btn-review" class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            <span id="review-label">Tinjau Pengajuan</span>
          </button>
        </form>
      </section>

      <!-- Bank + policy -->
      <section aria-labelledby="bank-title" class="rounded-2xl border border-border bg-white p-5 lg:p-6">
        <h2 id="bank-title" class="text-[17px] font-bold tracking-tight text-ink">Rekening Penerima</h2>
        <div id="bank-card-active" class="mt-3 space-y-1">
          <p class="text-[13.5px] font-semibold text-ink">Bank Central Asia (BCA)</p>
          <p class="text-[13px] text-muted">PT Kiblat Buku Utama</p>
          <p class="num text-[13px] text-muted">•••• 4892</p>
          <a href="{{ route('publisher.settings') }}" class="focus-ring mt-2 inline-flex items-center gap-1 rounded text-[12.5px] font-semibold text-primary hover:text-primary-hover">
            <span>Ubah Rekening</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
        <div id="bank-card-empty" class="mt-3 hidden">
          <p class="text-[13.5px] font-semibold text-ink">Rekening Bank Belum Terdaftar</p>
          <p class="mt-1 text-[13px] leading-relaxed text-muted">Tambahkan rekening penerbit sebelum mengajukan pencairan.</p>
          <a href="{{ route('publisher.settings') }}" class="focus-ring mt-3 inline-flex h-10 items-center rounded-xl border border-border px-3.5 text-[13px] font-semibold text-ink hover:bg-neutral">
            Tambahkan Rekening
          </a>
        </div>

        <div class="mt-5 border-t border-divider pt-4">
          <h3 class="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">Ketentuan pencairan</h3>
          <ul class="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-muted">
            <li>Minimum pencairan Rp 100.000.</li>
            <li>Pengajuan di atas Rp 5.000.000 memerlukan verifikasi tambahan.</li>
            <li>Ketentuan pada prototype ini adalah data simulasi.</li>
          </ul>
        </div>
      </section>
    </div>

    <!-- History -->
    <section aria-labelledby="history-title" class="rounded-2xl border border-border bg-white">
      <div class="flex flex-col gap-3 border-b border-divider p-5 lg:px-6">
        <h2 id="history-title" class="text-[17px] font-bold tracking-tight text-ink">Riwayat Pengajuan Pencairan</h2>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="relative w-full sm:max-w-[280px]">
            <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted">search</span>
            <label for="history-search" class="sr-only">Cari nomor pengajuan</label>
            <input id="history-search" type="search" autocomplete="off" placeholder="Cari nomor pengajuan..." class="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
          </div>
          <label for="history-filter" class="sr-only">Filter status</label>
          <select id="history-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
            <option value="all">Semua Status</option>
            <option value="proses">Dalam Proses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-left">
          <caption class="sr-only">Riwayat pengajuan pencairan penerbit</caption>
          <thead>
            <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
              <th scope="col" class="px-5 py-3 font-bold lg:px-6">Pengajuan</th>
              <th scope="col" class="w-36 px-4 py-3 text-right font-bold">Nominal</th>
              <th scope="col" class="w-32 px-4 py-3 font-bold">Rekening</th>
              <th scope="col" class="w-32 px-4 py-3 font-bold">Status</th>
              <th scope="col" class="w-24 px-4 py-3 pr-5 text-right font-bold lg:pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody id="history-rows" class="text-[13px]"></tbody>
        </table>
      </div>

      <div id="history-empty" class="hidden px-5 py-12 text-center">
        <p class="text-[15px] font-semibold text-ink">Pengajuan Tidak Ditemukan</p>
        <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada pengajuan yang cocok dengan pencarian atau filter ini.</p>
        <button type="button" id="btn-reset-filter" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13px] font-semibold text-ink hover:bg-neutral">
          Reset Pencarian &amp; Filter
        </button>
      </div>

      <div class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p class="text-[12.5px] text-muted" id="history-count">Menampilkan 0 dari 0 pengajuan</p>
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

@push('overlays')
  <div id="modal-confirm" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-confirm=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div class="mb-3 flex items-start justify-between gap-4">
        <h2 id="confirm-title" class="text-[18px] font-bold tracking-tight text-ink">Konfirmasi Pencairan</h2>
        <button type="button" data-close-confirm="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <dl class="space-y-2.5 text-[13px]">
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Nominal pencairan</dt><dd class="num font-semibold text-ink" id="confirm-amount">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Rekening tujuan</dt><dd class="text-ink" id="confirm-bank">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Penerima</dt><dd class="text-ink">PT Kiblat Buku Utama</dd></div>
      </dl>
      <p class="mt-4 text-[12px] leading-relaxed text-muted">Pengajuan pada prototype ini tidak dikirim ke sistem perbankan.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-confirm="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Kembali</button>
        <button type="button" id="btn-submit" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
          <span id="submit-label">Ajukan Pencairan</span>
        </button>
      </div>
    </div>
  </div>

  <div id="modal-success" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-success=""></div>
    <div class="relative mx-auto mt-24 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="success-title">
      <h2 id="success-title" class="text-[18px] font-bold tracking-tight text-ink">Pengajuan Diterima</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Pengajuan pencairan telah tercatat pada prototype ini dan menunggu proses berikutnya.</p>
      <dl class="mt-4 space-y-2.5 text-[13px]">
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">No. pengajuan</dt><dd class="num font-semibold text-ink" id="success-number">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Nominal</dt><dd class="num font-semibold text-ink" id="success-amount">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Status</dt><dd class="font-semibold text-ink">Dalam Proses</dd></div>
      </dl>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-success="" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Lihat Riwayat</button>
      </div>
    </div>
  </div>

  <div id="modal-detail" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-detail=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div class="mb-3 flex items-start justify-between gap-4">
        <h2 id="detail-title" class="text-[18px] font-bold tracking-tight text-ink">Detail Pencairan</h2>
        <button type="button" data-close-detail="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <dl class="space-y-2.5 text-[13px]">
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">No. pengajuan</dt><dd class="num font-semibold text-ink" id="detail-number">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Status</dt><dd class="font-semibold text-ink" id="detail-status">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Tanggal</dt><dd class="text-ink" id="detail-date">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Nominal</dt><dd class="num font-semibold text-ink" id="detail-amount">-</dd></div>
        <div class="flex items-baseline justify-between gap-4"><dt class="text-muted">Rekening</dt><dd class="text-ink" id="detail-bank">-</dd></div>
      </dl>
      <div class="mt-4 rounded-xl border border-border p-3.5">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Bukti transfer</p>
        <p class="mt-1 text-[13px] leading-relaxed text-ink" id="detail-proof">Belum tersedia dalam prototype ini.</p>
      </div>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-detail="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tutup</button>
      </div>
    </div>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P8 = { page: 'finance' };
</script>
@endpush
