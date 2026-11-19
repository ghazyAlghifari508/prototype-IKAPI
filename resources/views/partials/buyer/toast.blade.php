{{--
  Buyer toast. Source: <div id="toast"> in beranda (bottom-24 / translate-y-16, with #toast-icon),
  katalog (bottom-24 / translate-y-20) and detail + preview (bottom-6 / translate-y-20).
  Classes and ids are copied verbatim; only the vertical anchor and the default copy differ, so both are props.

  Props: position ('bottom-24'|'bottom-6'), offset ('translate-y-16'|'translate-y-20'), message, icon (bool).
  Behaviour: resources/js/ikapi/buyer/toast.js toggles the same utility classes as the prototype's showToast().
--}}
@php
    $position = $position ?? 'bottom-24';
    $offset = $offset ?? 'translate-y-20';
    $message = $message ?? 'Item berhasil ditambahkan ke keranjang';
@endphp

<div id="toast" data-ikapi-buyer-toast class="fixed {{ $position }} right-6 z-50 transform {{ $offset }} opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
  <span @if (! empty($icon)) id="toast-icon" @endif class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
  <span id="toast-message" data-ikapi-buyer-toast-text>{{ $message }}</span>
</div>
