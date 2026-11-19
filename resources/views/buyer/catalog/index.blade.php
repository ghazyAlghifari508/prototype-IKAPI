@extends('layouts.public')

{{--
  Katalog Buku. Source: user/katalog_buku_desktop.html (913 lines).
  Structure: editorial header -> toolbar (search / view toggle / sort) -> sticky filter sidebar + product grid
  -> empty state -> pagination bar. Grid cards reuse <x-ikapi.book-card variant="grid">; list view and the
  filter/sort/search/pagination pipeline are handled by resources/js/ikapi/buyer/catalog.js exactly like the
  prototype's runCatalogPipeline(), with the same literal class templates.
--}}
@section('title', 'Katalog Buku Digital — IKAPI Store Jawa Barat')
@section('main_class', 'min-h-[calc(100vh-16rem)]')
@section('cart_count', '2')

@section('content')
  <!-- Editorial Header Block -->
  <section class="w-full pt-6 pb-4 border-b border-border-subtle bg-white">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-[28px] sm:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
            Katalog Buku Digital
          </h1>
          <p class="text-[14px] sm:text-[15px] text-ink-muted mt-1">
            Jelajahi dan baca karya literasi terkurasi dari penerbit anggota IKAPI Jawa Barat.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="w-full py-8 bg-white">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Catalog Controls Toolbar (Unwrapped, directly on white canvas) -->
      <div class="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <!-- Inline Search Input -->
        <div class="relative flex-1 min-w-0">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-[19px]">search</span>
          <input id="catalog-search-input" class="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-neutral border border-border-subtle text-[14px] text-ink-body placeholder:text-ink-muted outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all" placeholder="Cari berdasarkan judul atau penulis..." type="text">
        </div>

        <!-- Controls: Layout Switch & Sorting -->
        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <!-- View Toggle (Grid vs List) -->
          <div class="flex items-center bg-surface-neutral p-1 rounded-xl border border-border-subtle">
            <button id="btn-view-grid" class="w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-white shadow-xs transition-colors cursor-pointer" title="Grid View" type="button" data-catalog-view="grid">
              <span class="material-symbols-outlined text-[19px]">grid_view</span>
            </button>
            <button id="btn-view-list" class="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-body hover:bg-white transition-colors cursor-pointer" title="List View" type="button" data-catalog-view="list">
              <span class="material-symbols-outlined text-[19px]">view_list</span>
            </button>
          </div>

          <!-- Sort Dropdown -->
          <div class="relative min-w-[200px]">
            <select id="catalog-sort-select" class="w-full h-11 pl-3.5 pr-9 rounded-xl bg-surface-neutral border border-border-subtle text-[13.5px] font-semibold text-ink-body outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] appearance-none cursor-pointer" data-catalog-sort>
              @foreach ($catalog['facets']['sortOptions'] as $option)
                <option value="{{ $option['value'] }}" @selected($option['value'] === $catalog['defaults']['sort'])>{{ $option['label'] }}</option>
              @endforeach
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-[19px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      <!-- MAIN CATALOG BODY (Sidebar + Fluid Product Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        @include('partials.buyer.catalog.filters', ['catalog' => $catalog])

        <!-- PRODUCT GRID (9 Cols Desktop) -->
        <div class="lg:col-span-9 flex flex-col gap-8">
          <!-- Product Grid Container -->
          <div id="catalog-products-container" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            @foreach ($catalog['books'] as $book)
              <x-ikapi.book-card :book="$book" variant="grid" :href="route('books.show', $book['slug'])" />
            @endforeach
          </div>

          <!-- Empty State Container (Hidden by default) -->
          <div id="catalog-empty-state" class="hidden p-10 sm:p-14 rounded-3xl bg-white border border-border-subtle shadow-xs text-center flex-col items-center justify-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-surface-soft border border-[#673de633] flex items-center justify-center text-primary mx-auto mb-1">
              <span class="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h3 class="text-[20px] font-bold text-ink-body tracking-tight">
              Tidak Ada Buku yang Cocok
            </h3>
            <p class="text-[14px] text-ink-muted max-w-sm">
              Coba sesuaikan kata kunci pencarian, filter kategori, atau rentang harga yang dipilih.
            </p>
            <button type="button" class="mt-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold transition-all shadow-xs cursor-pointer" data-catalog-reset>
              Reset Filter
            </button>
          </div>

          <!-- PAGINATION BAR -->
          <div id="catalog-pagination-bar" class="bg-surface-neutral rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-subtle shadow-xs">
            <span id="pagination-summary-text" class="text-[13.5px] text-ink-muted">Menampilkan <strong class="text-ink-body font-bold">1 – {{ count($catalog['books']) }}</strong> dari <strong class="text-ink-body font-bold">{{ count($catalog['books']) }}</strong> buku</span>
            <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none" id="pagination-controls">
              <button id="btn-page-prev" class="h-9 px-3.5 rounded-xl bg-white text-ink-muted hover:text-ink-body hover:bg-surface-soft text-[13px] font-semibold flex items-center gap-1 transition-colors border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" disabled type="button" data-catalog-page="prev">
                <span class="material-symbols-outlined text-[17px]">chevron_left</span>
                <span>Sebelumnya</span>
              </button>
              <button class="w-9 h-9 rounded-xl bg-primary text-white font-bold text-[13.5px] flex items-center justify-center shadow-xs cursor-pointer" type="button" data-catalog-page-number="1">
                1
              </button>
              <button id="btn-page-next" class="h-9 px-3.5 rounded-xl bg-white text-ink-muted hover:text-ink-body hover:bg-surface-soft text-[13px] font-semibold flex items-center gap-1 transition-colors border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" disabled type="button" data-catalog-page="next">
                <span>Selanjutnya</span>
                <span class="material-symbols-outlined text-[17px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {{-- Single source for the client pipeline: the same rows Blade just rendered. --}}
  <script type="application/json" id="catalog-data">@json($catalog)</script>
@endsection

@section('chatbot', '1')

@push('overlays')
  @include('partials.buyer.toast', ['position' => 'bottom-24', 'offset' => 'translate-y-20', 'icon' => false, 'message' => 'Item berhasil ditambahkan ke keranjang'])
@endpush