{{--
  Agenda Literasi strip. Source: section 5 of user/beranda_desktop.html (horizontal snap scroller, 4 cards,
  share button per card). Cards link to the agenda page, which is P07 scope: when that route is not registered
  the card title renders as plain text (no fake href) and the share button keeps working.
--}}
@php($agendaUrl = \App\Support\Navigation::href('agenda'))
@php($catalogUrl = \App\Support\Navigation::href('books.index'))
<section class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 border-t border-border-subtle">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-[22px] md:text-[26px] text-ink-body font-bold tracking-tight">Agenda Literasi</h2>
    <div class="flex items-center gap-2">
      <button id="agenda-scroll-prev" type="button" aria-label="Geser ke kiri" class="w-8 h-8 rounded-lg border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      <button id="agenda-scroll-next" type="button" aria-label="Geser ke kanan" class="w-8 h-8 rounded-lg border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
      <a class="inline-flex items-center gap-1 text-[14px] text-primary hover:text-primary-hover font-bold group ml-1" href="{{ $agendaUrl ?? $catalogUrl ?? '#' }}">
        <span>Lihat Semua</span>
        <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </a>
    </div>
  </div>

  <div id="agenda-scroll-container" class="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none">
    @foreach ($items as $item)
      <article class="w-[300px] sm:w-[320px] md:w-[340px] shrink-0 snap-start flex flex-col bg-white rounded-2xl border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all duration-300 overflow-hidden">
        <div class="relative w-full aspect-[16/10] overflow-hidden bg-surface-neutral">
          <img src="{{ asset('assets/ikapi/'.$item['image']) }}" alt="{{ $item['alt'] }}" class="w-full h-full object-cover">
        </div>
        <div class="p-5 flex flex-col flex-1 justify-between gap-3">
          <div class="flex flex-col gap-1.5">
            @if ($agendaUrl)
              <a href="{{ $agendaUrl }}" class="block">
                <h3 class="text-[15px] font-bold text-ink-body hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.8em]">{{ $item['title'] }}</h3>
              </a>
            @else
              <span class="block" title="Halaman agenda belum dimigrasi">
                <h3 class="text-[15px] font-bold text-ink-body leading-snug line-clamp-2 min-h-[2.8em]">{{ $item['title'] }}</h3>
              </span>
            @endif
            <div class="flex items-center gap-1.5 text-ink-muted text-[13px]">
              <span class="material-symbols-outlined text-[16px] text-primary shrink-0">calendar_today</span>
              <span class="truncate">{{ $item['date'] }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-ink-muted text-[13px]">
              <span class="material-symbols-outlined text-[16px] text-primary shrink-0">location_on</span>
              <span class="truncate">{{ $item['location'] }}</span>
            </div>
          </div>

          <div class="pt-3 border-t border-border-subtle flex items-center justify-between">
            <span class="{{ $item['priceClass'] ?? 'text-[14px] font-bold text-primary' }}">{{ $item['price'] }}</span>
            <button type="button" aria-label="Bagikan event {{ $item['shareTitle'] }}" data-title="{{ $item['shareTitle'] }}" class="btn-share-event flex items-center gap-1 text-[13px] text-ink-muted hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-[16px]">share</span>
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      </article>
    @endforeach
  </div>
</section>