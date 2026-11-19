{{--
  Category tiles. Source: section 1 of user/beranda_desktop.html (5 tiles, assets in assets/ root).
  Markup/classes copied; images and labels come from the fixture.
--}}
@php($catalogUrl = \App\Support\Navigation::href('books.index'))
<section class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
    @foreach ($categories as $category)
      <a class="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-surface-soft transition-all duration-200" href="{{ $catalogUrl ?? '#' }}">
        <div class="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-105">
          <img src="{{ asset('assets/ikapi/'.$category['image']) }}" alt="{{ $category['alt'] }}" class="w-full h-full object-contain">
        </div>
        <span class="text-[15px] text-ink-body font-semibold group-hover:text-primary transition-colors">{{ $category['label'] }}</span>
      </a>
    @endforeach
  </div>
</section>
