{{--
  Hero carousel. Source: section 0 of user/beranda_desktop.html (3 banner slides, arrows, dots).
  Structure, classes and ids are copied verbatim; slides come from the fixture (image + alt + link).
  Autoplay 6s (AUTOPLAY_DELAY in the prototype), paused for prefers-reduced-motion: implement in home.js.
--}}
@php($catalogUrl = \App\Support\Navigation::href('books.index'))
<section class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-8">
  <div id="hero-carousel" class="group relative w-full aspect-[16/9] md:aspect-[2.8/1] rounded-3xl overflow-hidden bg-surface-neutral border border-border-subtle shadow-sm select-none" aria-roledescription="carousel" aria-label="Sorotan Promosi IKAPI Store">

    <!-- Slides Track -->
    <div id="carousel-track" class="relative w-full h-full">
      @foreach ($slides as $i => $slide)
        <div class="carousel-slide absolute inset-0 w-full h-full transition-opacity duration-500 {{ $i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none' }}" data-slide="{{ $i }}" aria-hidden="{{ $i === 0 ? 'false' : 'true' }}">
          <a href="{{ $catalogUrl ?? '#' }}" class="block w-full h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-3xl">
            <img src="{{ asset('assets/ikapi/'.$slide['image']) }}" alt="{{ $slide['alt'] }}" class="w-full h-full object-cover">
          </a>
        </div>
      @endforeach
    </div>

    <!-- Navigation Arrow Buttons (Hostinger-inspired clean controls) -->
    <button id="carousel-prev" type="button" aria-label="Slide sebelumnya" class="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#ffffffe6] hover:bg-white text-ink-body shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105">
      <span class="material-symbols-outlined text-[22px]">chevron_left</span>
    </button>
    <button id="carousel-next" type="button" aria-label="Slide berikutnya" class="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#ffffffe6] hover:bg-white text-ink-body shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105">
      <span class="material-symbols-outlined text-[22px]">chevron_right</span>
    </button>

    <!-- Pagination Indicators -->
    <div class="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" role="tablist" aria-label="Navigasi Banner">
      @foreach ($slides as $i => $slide)
        <button type="button" id="carousel-dot-{{ $i }}" role="tab" aria-selected="{{ $i === 0 ? 'true' : 'false' }}" aria-label="Ke slide {{ $i + 1 }}" data-dot="{{ $i }}"
          class="carousel-dot h-2 rounded-full transition-all duration-300 {{ $i === 0 ? 'w-7 bg-primary' : 'w-2 bg-[#ffffffb3] hover:bg-white' }}"></button>
      @endforeach
    </div>

  </div>
</section>
