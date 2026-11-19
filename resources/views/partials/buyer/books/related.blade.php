{{--
  Buku Terkait. Source: section 4 of user/detail_buku_desktop.html (4 cards, same shelf-card markup as the home
  shelves -> reuses <x-ikapi.book-card variant="shelf">). Card copy comes from the detail fixture; the link
  resolves to the related book's own detail route when a matching catalog row exists.
--}}
@php
    $related = $book['detail']['related'] ?? [];
    $catalogUrl = \App\Support\Navigation::href('books.index');
@endphp

<section class="w-full py-12 bg-white border-t border-border-subtle">
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-[22px] md:text-[24px] font-bold text-ink-body tracking-tight">Buku Terkait</h2>
      <a class="inline-flex items-center gap-1 text-[14px] text-primary hover:text-primary-hover font-bold group" href="{{ $catalogUrl ?? '#' }}">
        <span>Lihat Semua</span>
        <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </a>
    </div>

    @if ($related)
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        @foreach ($related as $item)
          <x-ikapi.book-card variant="shelf" :href="$item['bookSlug'] ? route('books.show', $item['bookSlug']) : ($catalogUrl ?? '#')" :book="[
              'id' => $item['bookSlug'] ?? 'REL',
              'title' => $item['title'],
              'author' => $item['author'],
              'price' => $item['price'],
              'cover' => $item['cover'],
              'coverAlt' => $item['coverAlt'],
          ]" />
        @endforeach
      </div>
    @else
      <div class="rounded-2xl bg-surface-neutral border border-border-subtle p-5 text-[14px] text-ink-muted">
        Daftar buku terkait hanya ada untuk buku yang halaman detailnya sudah dibuat di prototipe.
      </div>
    @endif
  </div>
</section>