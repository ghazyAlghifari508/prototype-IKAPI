@extends('layouts.public')

{{--
  Preview Buku (cuplikan). Source: user/preview_buku_desktop.html (335 lines).
  The prototype has NO header and NO footer here ("zero navbar, pure white canvas"), so the shared public layout
  only supplies <head>/<body>; the reading surface, progress bar and controls come from the page itself.
  No PDF or reader endpoint is called: the pages are the fixture's sample paragraphs, like the reference.
--}}
@section('serif', '1')
@section('title', 'Cuplikan '.$book['title'].' — IKAPI Store Jawa Barat')
@section('no_header', '1')
@section('no_footer', '1')
@section('body_class', 'min-h-screen flex flex-col justify-between py-6 sm:py-10')
@section('main_pt', '')
@section('main_class', 'flex-1 flex flex-col items-center justify-center px-4 sm:px-6')

@php
    $pages = $preview['pages'];
    $first = $pages[0];
@endphp

@section('content')
  <div class="w-full max-w-[760px] flex flex-col items-stretch space-y-6">
    <!-- Top Clean Back Navigation -->
    <div class="flex items-center">
      <a href="{{ route('books.show', $book['slug']) }}" class="inline-flex items-center gap-1.5 text-ink-muted hover:text-primary text-[13.5px] font-semibold transition-colors">
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Kembali ke Detail Buku</span>
      </a>
    </div>

    <!-- Reading Article Surface (Directly on white canvas, zero border box) -->
    <article id="reader-content" class="w-full bg-white transition-opacity duration-200 scroll-mt-24">
      <div class="mb-6 pb-4 border-b border-border-subtle">
        <span id="preview-chapter" class="text-primary font-bold text-[12px] sm:text-[13px] uppercase tracking-wider block mb-1">{{ $first['chapter'] }}</span>
        <h2 id="preview-title" class="text-[24px] sm:text-[28px] font-bold text-ink-body tracking-tight leading-tight">
          {{ $first['title'] }}
        </h2>
      </div>
      <div id="preview-paragraphs" class="space-y-5">
        @foreach ($first['paragraphs'] as $paragraph)
          <p class="font-reading text-[17px] sm:text-[18px] text-ink-body leading-[1.85] text-left">{{ $paragraph }}</p>
        @endforeach
      </div>
    </article>

    <!-- Preview Progress Indicator (Cuplikan X dari Y semantics) -->
    <div class="flex flex-col items-center justify-center gap-2 pt-2">
      <span class="text-[13.5px] font-bold text-ink-body" id="preview-counter-badge">{{ $preview['counter'] ?? ('Cuplikan 1 dari '.count($pages)) }}</span>
      <div class="w-44 h-2 bg-surface-neutral rounded-full overflow-hidden border border-border-subtle shadow-xs">
        <div id="preview-progress-bar" class="h-full bg-primary rounded-full transition-all duration-300" style="width: {{ (int) round(100 / max(count($pages), 1)) }}%;"></div>
      </div>
    </div>

    <!-- Controls Bar: Prev/Next & Integrated Purchase CTA (Cleanly unwrapped) -->
    <div class="w-full pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Navigation Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
        <button id="btn-prev" type="button" class="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-border-subtle bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" disabled>
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          <span>Sebelumnya</span>
        </button>
        <button id="btn-next" type="button" class="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-border-subtle bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          <span>Berikutnya</span>
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
      <!-- Purchase Action Button (Hostinger Primary Solid Purple) -->
      <div class="w-full sm:w-auto">
        <button id="btnAddToCart" type="button" class="w-full sm:w-auto h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]">
          <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
          <span id="btnAddToCartText">Beli Buku Penuh (Rp {{ number_format((int) $book['price'], 0, ',', '.') }})</span>
        </button>
      </div>
    </div>
  </div>

  {{-- Page content for the client-side navigation, from the same fixture the server just rendered. --}}
  <script type="application/json" id="preview-data">@json(['pages' => $pages, 'title' => $book['title'], 'price' => (int) $book['price']])</script>
@endsection

@push('overlays')
  @include('partials.buyer.toast', ['position' => 'bottom-6', 'offset' => 'translate-y-20', 'icon' => false, 'message' => 'Buku berhasil ditambahkan ke keranjang'])
@endpush