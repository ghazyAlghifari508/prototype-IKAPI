{{--
  Book shelf. Source: sections 2-4 of user/beranda_desktop.html ("Rekomendasi Buku", "Buku Rilis Terbaru",
  "Buku Terlaris" - 5 cards each, same section/header/grid classes).
  Cards use <x-ikapi.book-card variant="shelf">, whose markup was copied from these very cards in P04.
--}}
@php($catalogUrl = \App\Support\Navigation::href('books.index'))
<section class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 border-t border-border-subtle">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-[22px] md:text-[26px] text-ink-body font-bold tracking-tight">{{ $shelf['title'] }}</h2>
    <a class="inline-flex items-center gap-1 text-[14px] text-primary hover:text-primary-hover font-bold group" href="{{ $catalogUrl ?? '#' }}">
      <span>Lihat Semua</span>
      <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
    </a>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
    @foreach ($shelf['books'] as $book)
      <x-ikapi.book-card :book="$book" variant="shelf" :href="route('books.show', $book['slug'])" />
    @endforeach
  </div>
</section>
