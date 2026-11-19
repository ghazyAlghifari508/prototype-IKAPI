{{--
  Book detail hero + purchase panel. Source: <section id="book-detail"> in user/detail_buku_desktop.html.
  The section keeps data-book-id (used by the rating/report code) and every id the prototype's script addresses.
--}}
@php
    $hasDetail = isset($book['detail']);
    $formatRupiah = static fn (int $n): string => 'Rp '.number_format($n, 0, ',', '.');
@endphp

<section id="book-detail" data-book-id="{{ $book['detail']['bookId'] ?? $book['id'] ?? '' }}" data-book-slug="{{ $book['slug'] }}" class="w-full pt-8 pb-12 bg-white">
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

      <!-- Left: Book Cover (5 Cols) -->
      <div class="lg:col-span-5 flex justify-center">
        <div class="w-full max-w-[340px] aspect-[2/3] rounded-2xl overflow-hidden bg-surface-neutral border border-border-subtle shadow-md">
          <img id="book-cover" src="{{ asset('assets/ikapi/'.$book['cover']) }}" alt="{{ $book['coverAlt'] }}" class="w-full h-full object-cover">
        </div>
      </div>

      <!-- Right: Product Information & Purchase CTAs (7 Cols) -->
      <div class="lg:col-span-7 flex flex-col justify-start gap-5">

        <!-- Title, Author & Publisher -->
        <div class="space-y-2">
          <h1 id="book-title" class="text-[28px] sm:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
            {{ $book['title'] }}
          </h1>
          <p class="text-[16px] text-ink-muted">
            Karya <span id="book-author" class="font-bold text-ink-body">{{ $book['author'] }}</span>
          </p>
          <div class="flex items-center gap-3 text-[13px] text-ink-muted pt-0.5">
            <span id="book-publisher" class="font-medium text-primary">Penerbit {{ $book['publisher'] }}</span>
            <span>Tahun Terbit {{ $book['year'] }}</span>
          </div>
        </div>

        @if ($hasDetail)
          <!-- Compact Supporting Metadata Row -->
          <div class="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-muted">
            <span class="px-3 py-1 rounded-full bg-surface-neutral text-ink-body font-medium border border-border-subtle">{{ $book['detail']['rows'][3]['value'] ?? 'Bahasa Indonesia' }}</span>
            <span class="px-3 py-1 rounded-full bg-surface-neutral text-ink-body font-medium border border-border-subtle">{{ $book['detail']['rows'][5]['value'] ?? '' }}</span>
          </div>
        @endif

        <!-- Compact Hostinger Purchase Panel -->
        <div class="space-y-4 mt-1">
          <div>
            <span class="text-[12px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Harga Lisensi Baca</span>
            <div class="text-[32px] sm:text-[36px] font-bold text-ink-body tracking-tight leading-none">
              {{ $formatRupiah((int) $book['price']) }}
            </div>
          </div>

          <!-- Primary CTA -->
          <button id="btnAddToCart" type="button" aria-label="Tambah ke Keranjang" class="w-full h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]" data-book-id="{{ $book['id'] }}" data-book-title="{{ $book['title'] }}" data-book-price="{{ $book['price'] }}">
            <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span id="btnAddToCartText">Tambah ke Keranjang</span>
          </button>

          <!-- Secondary CTAs: Baca Cuplikan & Wishlist -->
          <div class="flex items-center gap-3 pt-1">
            <a id="btnSamplePreview" href="{{ route('books.preview', $book['slug']) }}" class="flex-1 h-11 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-soft text-ink-body text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[19px] text-primary">book_2</span>
              <span>Baca Cuplikan</span>
            </a>
            <button id="btnWishlist" type="button" aria-label="Tambah ke Favorit" class="h-11 w-11 rounded-xl border border-border-subtle bg-white hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors cursor-pointer">
              <span id="wishlistIcon" class="material-symbols-outlined text-[20px]">favorite_border</span>
            </button>
          </div>

          <!-- Report book: text button, secondary weight -->
          <div class="pt-0.5">
            <button id="btn-report-book" type="button" aria-haspopup="dialog" class="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-surface-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#673de666] focus-visible:ring-offset-2">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">flag</span>
              <span>Laporkan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>