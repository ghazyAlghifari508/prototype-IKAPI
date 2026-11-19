{{--
  Invoice penjualan: pratinjau cetak (toolbar no-print + lembar invoice). Bukan PDF server, bukan endpoint baru.
  Source: docs/design/prototype-copy/penerbit/invoice_penjualan_pdf_portal_penerbit.html (312 baris), markup verbatim.
--}}

@extends('layouts.plain')

@section('title', 'Invoice Penjualan — IKAPI Jawa Barat')

@section('body_class', 'antialiased')

@push('head')
<style>
@layer utilities {
html, body { margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #FFFFFF; color: #222225; }
  .num { font-variant-numeric: tabular-nums; }
  .focus-ring:focus-visible { outline: 2px solid #673DE6; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }

  /* Screen: paper mimics the A4 print area */
  .invoice-sheet {
    width: 210mm;
    min-height: 297mm;
    padding: 16mm;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
  }
  @media (max-width: 820px) {
    .invoice-sheet { width: 100%; min-height: 0; padding: 24px 20px; }
  }

  @page { size: A4 portrait; margin: 12mm; }

  @media print {
    html, body { background: #FFFFFF !important; }
    .no-print { display: none !important; }
    .invoice-sheet {
      width: auto;
      min-height: 0;
      padding: 0;
      box-shadow: none !important;
      border: none !important;
      margin: 0;
    }
    .invoice-sheet table { page-break-inside: auto; }
    .invoice-sheet thead { display: table-header-group; }
    .invoice-sheet tr { break-inside: avoid; page-break-inside: avoid; }
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }
  }
}
</style>
@endpush

@section('content')
<div class="no-print sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
  <div class="mx-auto flex w-full max-w-[1020px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <a href="{{ route('publisher.orders') }}" class="focus-ring inline-flex w-fit items-center gap-2 rounded-xl px-2.5 py-2 text-[14px] font-semibold text-ink transition-colors hover:bg-viewer">
      <span class="material-symbols-outlined text-[20px]">arrow_back</span>
      <span>Kembali ke Pesanan Masuk</span>
    </a>

    <div class="flex flex-wrap items-center gap-2">
      <button type="button" id="btn-print" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">print</span>
        <span>Cetak / Simpan PDF</span>
      </button>
    </div>
  </div>
</div>

<main class="flex justify-center px-4 py-8 sm:px-6 sm:py-10">
  <article id="invoice-sheet" class="invoice-sheet" aria-labelledby="doc-title">

    <!-- Header -->
    <header class="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start">
        <img src="{{ asset('assets/ikapi/logo-ikapi-jabar.png') }}" alt="Logo IKAPI Jawa Barat" class="h-9 w-auto shrink-0 object-contain" id="doc-logo">
      </div>

      <div class="sm:text-right">
        <h1 id="doc-title" class="text-[20px] font-semibold leading-tight tracking-tight text-ink">Invoice Penjualan</h1>
        <p class="num mt-1 text-[12.5px] font-medium text-muted" id="doc-number">INV/2026/11/041-0082</p>
        <p class="mt-2 inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[12px] font-semibold text-ink" id="doc-status">Lunas</p>
      </div>
    </header>

    <!-- Issuer & publisher -->
    <section class="grid grid-cols-1 gap-6 border-b border-border py-6 sm:grid-cols-2" aria-label="Identitas dokumen">
      <div>
        <h2 class="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Diterbitkan oleh</h2>
        <p class="text-[14px] font-semibold text-ink">IKAPI Jawa Barat</p>
      </div>
      <div>
        <h2 class="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Untuk penerbit</h2>
        <p class="text-[14px] font-semibold text-ink" id="pub-name">PT Kiblat Buku Utama</p>
        <dl class="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-muted">
          <div class="flex gap-2">
            <dt class="shrink-0">No. Anggota</dt>
            <dd class="num text-ink" id="pub-member">041/JBA/2020</dd>
          </div>
          <div class="flex gap-2">
            <dt class="shrink-0">Alamat</dt>
            <dd id="pub-address">Jl. Lengkong Besar No. 127, Bandung 40261</dd>
          </div>
          <div class="flex gap-2">
            <dt class="shrink-0">Email</dt>
            <dd id="pub-email">redaksi@kiblatbuku.co.id</dd>
        </div>
      </dl>
      </div>
    </section>

    <!-- Transaction metadata -->
    <section class="avoid-break border-b border-border py-6" aria-labelledby="meta-title">
      <h2 id="meta-title" class="sr-only">Informasi transaksi</h2>
      <dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">No. Pesanan</dt>
          <dd class="num mt-1 text-[13px] font-semibold text-ink" id="meta-order">ORD-2026-11082</dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Tanggal bayar</dt>
          <dd class="mt-1 text-[13px] font-medium text-ink" id="meta-paid">14 November 2026, 14:30 WIB</dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Metode pembayaran</dt>
          <dd class="mt-1 text-[13px] font-medium text-ink" id="meta-method">QRIS</dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Status pembayaran</dt>
          <dd class="mt-1 text-[13px] font-medium text-ink" id="meta-status">Lunas</dd>
        </div>
        <div>
          <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Jumlah item</dt>
          <dd class="num mt-1 text-[13px] font-medium text-ink" id="meta-items">1 e-book</dd>
        </div>
      </dl>
    </section>

    <!-- Items -->
    <section class="avoid-break py-6" aria-labelledby="items-title">
      <h2 id="items-title" class="sr-only">Rincian item</h2>
      <table class="w-full border-collapse text-left">
        <caption class="sr-only">Daftar e-book yang terjual pada pesanan ini beserta jumlah, harga satuan, dan total</caption>
        <thead>
          <tr class="border-b border-border text-[11px] uppercase tracking-[0.08em] text-muted">
            <th scope="col" class="pb-2 pr-3 font-bold">E-Book</th>
            <th scope="col" class="w-16 pb-2 px-3 text-center font-bold">Jumlah</th>
            <th scope="col" class="w-32 pb-2 px-3 text-right font-bold">Harga Satuan</th>
            <th scope="col" class="w-32 pb-2 pl-3 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody id="item-rows" class="text-[13px]"></tbody>
      </table>
    </section>

    <!-- Financial summary -->
    <section class="avoid-break pb-6" aria-labelledby="summary-title">
      <h2 id="summary-title" class="sr-only">Ringkasan pendapatan</h2>
      <dl class="space-y-2 text-[13px]">
        <div class="flex items-baseline justify-between gap-4">
          <dt class="text-muted">Nilai penjualan</dt>
          <dd class="num font-medium text-ink" id="sum-gross">Rp 268.000</dd>
        </div>
        <div class="flex items-baseline justify-between gap-4">
          <dt class="text-muted">Biaya platform (10%)</dt>
          <dd class="num font-medium text-ink" id="sum-fee">− Rp 26.800</dd>
        </div>
        <div class="mt-1 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt class="text-[13.5px] font-semibold text-ink">Pendapatan bersih penerbit</dt>
          <dd class="num text-[17px] font-bold tracking-tight text-primary-deep" id="sum-net">Rp 241.200</dd>
        </div>
      </dl>
      <p class="mt-3 text-[11.5px] leading-relaxed text-muted">Biaya platform dihitung 10% dari nilai penjualan.</p>
    </section>
  </article>
</main>
@endsection
