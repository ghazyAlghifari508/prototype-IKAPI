{{--
  Book card. Consumers (P04 audit): katalog grid (12 cards), beranda shelves (19 <article> in 4 shelves),
  katalog list view. The markup of the two cover-first variants is copied from the prototype templates.

  Variants
    grid   user/katalog_buku_desktop.html grid template: bordered card, E-Book chip, category + publisher row,
           "Harga Lisensi" price block, cart button + "Detail" button.
    shelf  user/beranda_desktop.html shelves: cover, title, author, price + round cart button (no card chrome).

  Props
    book    array with the fixture keys id, title, author, category, publisher, price, cover (resources/data/ikapi/books.json)
    variant 'grid' | 'shelf'
    href    detail link (named route; defaults to '#' when the detail route is not registered yet)
  The cart button keeps the prototype attributes (data-book-id/-title/-price) so P05 can hook behaviour without
  changing markup. No global ids are emitted.
--}}
@props(['book', 'variant' => 'grid', 'href' => '#'])

@php
    $cover = asset('assets/ikapi/covers/'.basename($book['cover']));
    $price = 'Rp '.number_format((int) $book['price'], 0, ',', '.');
@endphp

@if ($variant === 'shelf')
  <article class="group flex flex-col justify-between">
    <div>
      <a href="{{ $href }}" class="block">
        <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral mb-2.5 border border-border-subtle shadow-xs">
          <img src="{{ $cover }}" alt="Sampul buku {{ $book['title'] }}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
        </div>
      </a>
      <a href="{{ $href }}" class="block">
        <h3 class="text-[15px] text-ink-body font-bold leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-primary transition-colors">{{ $book['title'] }}</h3>
      </a>
      <p class="text-[13px] text-ink-muted line-clamp-1 mt-0.5">{{ $book['author'] }}</p>
    </div>
    <div class="mt-2.5 pt-1 flex items-center justify-between">
      <span class="text-[16px] font-bold text-ink-body">{{ $price }}</span>
      <button type="button" aria-label="Tambah {{ $book['title'] }} ke keranjang" data-book-id="{{ $book['id'] }}" data-book-title="{{ $book['title'] }}" data-book-price="{{ $book['price'] }}" class="btn-add-to-cart w-8 h-8 rounded-lg bg-surface-soft hover:bg-primary text-primary hover:text-white transition-colors flex items-center justify-center border border-[#673de633] hover:border-transparent cursor-pointer">
        <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
      </button>
    </div>
  </article>
@else
  <article class="group bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all flex flex-col justify-between">
    <div>
      <a href="{{ $href }}" class="block">
        <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral mb-3 border border-border-subtle shadow-xs">
          <img src="{{ $cover }}" alt="Sampul {{ $book['title'] }}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
          <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#ffffffe6] backdrop-blur-xs text-ink-body text-[10px] font-bold tracking-wide uppercase shadow-xs">
            E-Book
          </div>
        </div>
      </a>
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="px-2 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px] truncate">{{ $book['category'] }}</span>
        <span class="text-[12px] text-ink-muted truncate font-medium">{{ $book['publisher'] }}</span>
      </div>
      <a href="{{ $href }}" class="block">
        <h3 class="text-[15px] font-bold text-ink-body leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-primary transition-colors">{{ $book['title'] }}</h3>
      </a>
      <p class="text-[13px] text-ink-muted line-clamp-1 mt-0.5">{{ $book['author'] }}</p>
    </div>
    <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
      <div>
        <span class="block text-[10px] text-ink-muted uppercase font-bold tracking-wider">Harga Lisensi</span>
        <span class="text-[17px] text-ink-body font-bold font-sans">{{ $price }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" title="Tambah ke Keranjang" data-book-id="{{ $book['id'] }}" data-book-title="{{ $book['title'] }}" data-book-price="{{ $book['price'] }}" class="btn-add-to-cart w-9 h-9 rounded-xl bg-surface-neutral hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-border-subtle cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
        </button>
        <a href="{{ $href }}" class="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center transition-colors shadow-xs">
          Detail
        </a>
      </div>
    </div>
  </article>
@endif
