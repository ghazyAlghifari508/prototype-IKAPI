{{--
  Portal modal frame. Source: 16 modals in 8 portal pages (admin: kelola_pencairan, kelola_pengguna,
  moderasi_ulasan, pengawasan_katalog; publisher: kelola_buku, pendapatan, pengaturan_profil, pesanan_masuk).

  Frame measured in the prototype:
    root      fixed inset-0 z-[80] (admin) | z-[70] (publisher) hidden
    backdrop  absolute inset-0 bg-[#222225]/45
    panel     relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[N] overflow-y-auto
              rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6
              role="dialog" aria-modal="true" aria-labelledby=<title id>

  Props
    id        unique id (REQUIRED) - the component derives `<id>-title` so repeated modals never share ids
    title     dialog heading
    width     max width in px: 420 | 440 | 460 | 520   (the four values used in the source)
    z         80 | 70
    top       'mt-20' | 'mt-24' | 'mt-16' | 'mt-12'    (4 vertical offsets in the source)
  Slots
    default   body (between heading and footer)
    footer    action buttons (rendered inside `flex justify-end gap-2 border-t border-divider pt-4`)

  Behaviour (resources/js/ikapi/modal.js): data-ikapi-modal-open="<id>" opens it, data-ikapi-modal-close or the
  backdrop closes it, Escape closes the top-most modal, body scroll is locked while open, focus moves into the
  panel and returns to the trigger.
--}}
@props([
    'id',
    'title',
    'width' => 440,
    'z' => 80,
    'top' => 'mt-20',
])

@php
    $titleId = $id.'-title';
    $zClass = $z === 70 ? 'z-[70]' : 'z-[80]';
    $widthClass = match ((int) $width) {
        420 => 'max-w-[420px]',
        460 => 'max-w-[460px]',
        520 => 'max-w-[520px]',
        default => 'max-w-[440px]',
    };
    $topClass = match ($top) {
        'mt-24' => 'mt-24',
        'mt-16' => 'mt-16',
        'mt-12' => 'mt-12',
        default => 'mt-20',
    };
@endphp

<div id="{{ $id }}" data-ikapi-modal class="fixed inset-0 {{ $zClass }} hidden">
  <div class="absolute inset-0 bg-[#222225]/45" data-ikapi-modal-close></div>
  <div class="relative mx-auto {{ $topClass }} max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] {{ $widthClass }} overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6"
    role="dialog" aria-modal="true" aria-labelledby="{{ $titleId }}" tabindex="-1">
    <h2 id="{{ $titleId }}" class="text-[18px] font-bold tracking-tight text-ink">{{ $title }}</h2>
    {{ $slot }}
    @isset($footer)
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        {{ $footer }}
      </div>
    @endisset
  </div>
</div>
